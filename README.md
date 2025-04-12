<div align="center">
  <img src="https://github.com/Zoqi-Andrew-Senior-Project/ScriboAI-Consumer/blob/main/consumer_frontend/public/minilogo.png?raw=true" alt="ScriboAI Logo" width="300"/>
</div>

# ScriboAI

**ScriboAI** is a web-based platform that simplifies and accelerates the creation of corporate training programs through the power of artificial intelligence. Designed to overcome common challenges like cost, time constraints, and content quality, ScriboAI provides a seamless experience for both training managers and employees.

## 🚀 Key Features

- **AI-Powered Course Generation**  
  -  Instantly generate structured course outlines and detailed content using Llama and Gemma.

- **Dual User Experience**
  - **Training Manager View**: Create and design courses, manage employees, and assign training modules.
  - **Employee View**: Access assigned materials and track learning progress.

- **Employee Management**
  - Invite users  
  - Assign roles  
  - Manage course assignments

- **Efficient Workflow**  
  Dual-server architecture separates the customer-facing frontend from the LLM-powered backend to optimize performance and scalability.

## 🛠 Architecture

ScriboAI runs on a **dual-server architecture**:
- **Frontend Application**: Manages user interactions and training workflows.
  -  Stack: Vite/React, Django, Nginx, MongoDB, Redis, Certbot
- **Backend LLM Server**: Handles course content generation using advanced models (Llama and Gemma).
  -  Stack: FastAPI, Haystack
  -  Which can be found at https://huggingface.co/spaces/ZoqiAndrewSeniorProject/TrainingCourseGen

This modular design ensures rapid module creation, responsive user experience, and scalable deployment.
