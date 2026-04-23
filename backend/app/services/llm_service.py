from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain.schema import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough
from typing import List, Optional
import json
import re
import httpx
import logging
import hashlib
from ..models.chat import SymptomAnalysis, RiskLevel

class LLMService:
    def __init__(
        self,
        api_key: str,
        model: str = "gpt-3.5-turbo",
        enable_ollama: bool = False,
        ollama_base_url: str = "http://127.0.0.1:11434",
        ollama_model: str = "llama3.1:8b",
    ):
        self.api_key = api_key
        self.llm = None
        self._logger = logging.getLogger(__name__)

        self.enable_ollama = enable_ollama
        self.ollama_base_url = ollama_base_url.rstrip("/")
        self.ollama_model = ollama_model
        self._ollama_client = httpx.Client(base_url=self.ollama_base_url, timeout=60.0)

        if api_key:
            self.llm = ChatOpenAI(
                openai_api_key=api_key,
                model=model,
                temperature=0.3,  # Lower temperature for medical advice
                max_tokens=1500
            )

        # System prompts for different functionalities
        self.medical_system_prompt = """
        You are a medical assistant AI. You provide helpful, accurate information about health and symptoms,
        but you ALWAYS emphasize that you are not a substitute for professional medical advice.

        Key principles:
        1. Never diagnose conditions
        2. Always recommend consulting healthcare professionals
        3. Provide general information only
        4. Be empathetic and supportive
        5. Include appropriate medical disclaimers

        When discussing symptoms, focus on:
        - General information about possible causes
        - When to seek medical attention
        - Basic self-care measures
        - Preventive measures
        """

        self.symptom_analysis_prompt = """
        Analyze the following symptoms and provide a structured assessment.
        Return your response as a JSON object with this exact structure:

        {
            "symptoms": ["list", "of", "identified", "symptoms"],
            "severity_score": <number 1-10, where 1 is mild and 10 is life-threatening>,
            "risk_level": "<low|medium|high>",
            "possible_conditions": ["list", "of", "possible", "general", "conditions"],
            "urgency_recommendation": "<recommendation for when to seek medical help>"
        }

        Guidelines for scoring:
        - Severity 1-3: Mild symptoms, can usually wait for routine care
        - Severity 4-6: Moderate symptoms, should see doctor within days
        - Severity 7-10: Severe symptoms, seek immediate medical attention

        Risk levels:
        - LOW: Non-urgent, can be managed at home
        - MEDIUM: Should see healthcare provider within days
        - HIGH: Requires immediate medical attention

        Be conservative with high severity scores. When in doubt, err on the side of caution.
        """

    def supports_llm(self) -> bool:
        return bool(self.llm) or bool(self.enable_ollama)

    def _ollama_generate(self, prompt: str) -> Optional[str]:
        """Return generated text from Ollama, or None if unavailable."""
        if not self.enable_ollama:
            return None
        try:
            resp = self._ollama_client.post(
                "/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                },
            )
            if resp.status_code != 200:
                self._logger.warning("ollama_non_200: %s %s", resp.status_code, resp.text[:300])
                return None
            data = resp.json()
            text = (data.get("response") or "").strip()
            return text or None
        except Exception as e:
            self._logger.warning("ollama_unavailable: %s", e)
            return None

    def analyze_symptoms(self, symptoms: List[str], user_description: str = "") -> SymptomAnalysis:
        """Analyze symptoms and return structured assessment."""
        if not self.llm:
            symptom_set = {s.lower() for s in symptoms}

            high_risk_signals = {"chest pain", "shortness of breath"}
            medium_risk_signals = {"fever", "dizziness", "cough", "persistent cough", "sore throat", "diarrhea"}

            if symptom_set & high_risk_signals:
                severity = 8
                risk = RiskLevel.HIGH
                urgency = "Seek immediate medical attention or emergency care."
            elif symptom_set & medium_risk_signals:
                severity = 5
                risk = RiskLevel.MEDIUM
                urgency = "Book an appointment with a healthcare professional within 24-72 hours."
            else:
                severity = 3 if symptoms else 2
                risk = RiskLevel.LOW
                urgency = "Monitor symptoms and consult a clinician if symptoms worsen or persist."

            possible = []
            if "fever" in symptom_set and "cough" in symptom_set:
                possible.append("Respiratory infection pattern (clinical evaluation needed)")
            if "fever" in symptom_set and "headache" in symptom_set:
                possible.append("Viral illness / dehydration pattern (clinical evaluation needed)")
            if "diarrhea" in symptom_set:
                possible.append("Gastrointestinal upset pattern (clinical evaluation needed)")
            if "sore throat" in symptom_set:
                possible.append("Upper respiratory irritation pattern (clinical evaluation needed)")
            if not possible:
                possible = ["General symptom cluster requiring clinical correlation"]

            return SymptomAnalysis(
                symptoms=symptoms,
                severity_score=severity,
                risk_level=risk,
                possible_conditions=possible,
                urgency_recommendation=urgency
            )

        symptoms_text = ", ".join(symptoms)
        full_description = f"Symptoms: {symptoms_text}\nDescription: {user_description}"

        prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(self.symptom_analysis_prompt),
            HumanMessagePromptTemplate.from_template("Please analyze these symptoms: {symptoms}")
        ])

        chain = prompt | self.llm | StrOutputParser()

        try:
            response = chain.invoke({"symptoms": full_description})
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                analysis_data = json.loads(json_match.group())
                return SymptomAnalysis(**analysis_data)
            else:
                # Fallback analysis
                return SymptomAnalysis(
                    symptoms=symptoms,
                    severity_score=5,
                    risk_level=RiskLevel.MEDIUM,
                    possible_conditions=["Unknown - please consult a doctor"],
                    urgency_recommendation="Please consult a healthcare professional for proper evaluation."
                )
        except Exception as e:
            print(f"Error in symptom analysis: {e}")
            return SymptomAnalysis(
                symptoms=symptoms,
                severity_score=5,
                risk_level=RiskLevel.MEDIUM,
                possible_conditions=["Unable to analyze - consult a doctor"],
                urgency_recommendation="Please seek medical attention for proper evaluation."
            )

    def generate_medical_response(self, query: str, context: Optional[List[str]] = None, symptom_analysis: Optional[SymptomAnalysis] = None) -> str:
        """Generate a medical response using RAG with symptom analysis."""

        if not self.llm:
            # Non-AI response: varied, symptom-specific, deterministic (no OpenAI/Ollama).
            seed = int(hashlib.md5(query.strip().lower().encode("utf-8")).hexdigest()[:8], 16)

            def pick(options: List[str]) -> str:
                if not options:
                    return ""
                return options[seed % len(options)]

            symptoms = (symptom_analysis.symptoms if symptom_analysis and symptom_analysis.symptoms else []) if symptom_analysis else []
            risk = symptom_analysis.risk_level.value if symptom_analysis else "unknown"
            severity = symptom_analysis.severity_score if symptom_analysis else None
            urgency = symptom_analysis.urgency_recommendation if symptom_analysis else ""

            symptom_set = {s.lower() for s in symptoms}

            symptom_guidance: dict[str, dict[str, List[str]]] = {
                "fever": {
                    "causes": ["a viral infection (like a cold/flu)", "a bacterial infection", "heat/exertion or dehydration"],
                    "self_care": ["rest and drink fluids", "track your temperature", "consider acetaminophen/paracetamol if appropriate"],
                    "red_flags": ["fever ≥ 39.4°C (103°F)", "fever lasting > 3 days", "stiff neck, severe headache, or rash"],
                    "questions": ["How high is the fever and for how many days?", "Any sore throat, cough, or urinary symptoms?"],
                },
                "headache": {
                    "causes": ["tension headache", "migraine", "dehydration or lack of sleep"],
                    "self_care": ["hydrate and rest in a dark room", "limit screen time", "use a cold/warm compress"],
                    "red_flags": ["sudden 'worst headache of your life'", "weakness, confusion, or new vision changes", "headache after injury"],
                    "questions": ["Is it one-sided or all over? Any nausea/light sensitivity?", "Any recent head injury?"],
                },
                "cough": {
                    "causes": ["viral upper respiratory infection", "post-nasal drip/allergies", "bronchitis"],
                    "self_care": ["warm fluids/honey (if age-appropriate)", "steam/humidifier", "avoid smoke and irritants"],
                    "red_flags": ["shortness of breath", "coughing blood", "chest pain or bluish lips"],
                    "questions": ["How long have you had the cough?", "Is there phlegm? If yes, what color?"],
                },
                "sore throat": {
                    "causes": ["viral sore throat", "strep throat (especially with fever and no cough)", "post-nasal drip"],
                    "self_care": ["warm salt-water gargles", "hydration", "lozenges or warm tea"],
                    "red_flags": ["trouble breathing or swallowing saliva", "one-sided throat swelling", "persistent high fever"],
                    "questions": ["Do you also have a cough/runny nose?", "Any swollen neck glands or white patches in the throat?"],
                },
                "diarrhea": {
                    "causes": ["food-related illness", "viral gastroenteritis", "medication side effects"],
                    "self_care": ["oral rehydration solution", "light meals (BRAT-style) if tolerated", "avoid alcohol and very fatty foods"],
                    "red_flags": ["blood in stool", "signs of dehydration (dizziness, very dry mouth, minimal urination)", "severe abdominal pain"],
                    "questions": ["How many times today? Any blood or severe cramps?", "Any recent travel or suspicious food?"],
                },
                "chest pain": {
                    "causes": ["muscle strain", "acid reflux", "anxiety — but urgent causes must be ruled out"],
                    "self_care": ["avoid exertion until evaluated", "note triggers (movement, meals, breathing)"],
                    "red_flags": ["pressure-like chest pain", "pain with shortness of breath/sweating", "pain radiating to jaw/arm"],
                    "questions": ["Is it sharp or pressure-like? Worse with breathing or movement?", "Any shortness of breath, sweating, or nausea?"],
                },
                "shortness of breath": {
                    "causes": ["asthma/bronchospasm", "infection", "anxiety — but urgent causes must be ruled out"],
                    "self_care": ["sit upright and pace breathing", "avoid triggers/smoke", "use prescribed inhaler if you have one"],
                    "red_flags": ["trouble speaking full sentences", "bluish lips/fingertips", "fainting or severe chest pain"],
                    "questions": ["Did this start suddenly or gradually?", "Any wheezing, chest pain, or fever?"],
                },
            }

            def collect(kind: str, limit: int = 4) -> List[str]:
                out: List[str] = []
                for s in symptoms:
                    key = s.lower()
                    if key in symptom_guidance:
                        out.extend(symptom_guidance[key].get(kind, []))
                # de-dup
                seen = set()
                uniq = []
                for x in out:
                    if x not in seen:
                        seen.add(x)
                        uniq.append(x)
                return uniq[:limit]

            causes = collect("causes", limit=5)
            self_care = collect("self_care", limit=5)
            specific_red_flags = collect("red_flags", limit=5)
            questions = collect("questions", limit=3)

            intro = pick(
                [
                    "Got it — here's guidance based on what you described.",
                    "Thanks for sharing — here's a quick, practical next-step plan.",
                    "Understood — here's what to consider and what to do next.",
                ]
            )

            risk_line = ""
            if severity is not None and risk != "unknown":
                risk_line = f"Triage: {risk.upper()} (severity {severity}/10)."

            noted = ""
            if symptoms:
                noted = f"Noted: {', '.join(symptoms)}."

            sections: List[str] = [intro]
            if risk_line:
                sections.append(risk_line)
            if noted:
                sections.append(noted)
            if urgency:
                sections.append(f"Recommended next step: {urgency}")

            if causes:
                sections.append("Common possibilities (not a diagnosis): " + ", ".join(causes) + ".")

            if self_care:
                sections.append("Self-care you can try now:\n" + "\n".join([f"- {x}" for x in self_care]))

            # Red flags vary by symptoms + risk level
            base_red_flags = [
                "severe or rapidly worsening symptoms",
                "fainting, confusion, or new weakness",
                "uncontrolled vomiting or signs of dehydration",
            ]
            if "chest pain" in symptom_set or "shortness of breath" in symptom_set:
                base_red_flags.append("chest pain/pressure or trouble breathing")

            rf = specific_red_flags + base_red_flags
            # keep deterministic subset
            rf = rf[:5]
            sections.append("Seek urgent care now if you have:\n" + "\n".join([f"- {x}" for x in rf]))

            if questions:
                sections.append("Quick questions (to refine this):\n" + "\n".join([f"- {q}" for q in questions]))
            else:
                sections.append("Quick questions (to refine this):\n- How long has this been going on?\n- Your age group and any major conditions/meds?")

            context_snippets = ""
            if context:
                snippets = [c.strip() for c in context[:2] if c and c.strip()]
                if snippets:
                    context_snippets = "\n\nHelpful info (from your knowledge base):\n- " + "\n- ".join(snippets)

            return "\n\n".join(sections) + context_snippets + "\n\nMedical disclaimer: This is not medical advice."

        # Build context
        context_text = ""
        if context:
            context_text = "\n\n".join(context)

        # Add symptom analysis if available
        analysis_text = ""
        if symptom_analysis:
            analysis_text = f"""
            Symptom Analysis:
            - Identified Symptoms: {', '.join(symptom_analysis.symptoms)}
            - Severity Score: {symptom_analysis.severity_score}/10
            - Risk Level: {symptom_analysis.risk_level.value.upper()}
            - Possible General Conditions: {', '.join(symptom_analysis.possible_conditions)}
            - Urgency: {symptom_analysis.urgency_recommendation}
            """

        template = f"""{self.medical_system_prompt}

        Context Information:
        {{context}}

        Symptom Analysis:
        {{analysis}}

        User Query: {{question}}

        Provide a helpful response that:
        1. Acknowledges the user's symptoms/concerns
        2. Provides general information based on the context
        3. Includes the symptom analysis insights
        4. Gives appropriate precautions and self-care advice
        5. Strongly recommends professional medical consultation
        6. Ends with the medical disclaimer

        Response:"""

        prompt = ChatPromptTemplate.from_template(template)

        chain = (
            {
                "context": lambda x: context_text,
                "analysis": lambda x: analysis_text,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

        return chain.invoke(query)

    def generate_response(self, query: str, context: Optional[List[str]] = None) -> str:
        """Legacy method for backward compatibility."""
        return self.generate_medical_response(query, context)

    def summarize_context(self, documents: List[str]) -> str:
        """Summarize retrieved documents for context."""
        if not documents:
            return ""

        template = """Summarize the following healthcare information concisely, focusing on key symptoms, causes, and general advice:

{documents}

Summary:"""

        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.llm | StrOutputParser()

        docs_text = "\n\n".join(documents[:3])  # Limit to top 3
        return chain.invoke({"documents": docs_text})