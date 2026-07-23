<div align="center">

# ⚖️ THEMIS — Autonomous Code Review & Security Analysis Platform

**Track 2 (Agentic AI) — AMD AI DevMaster Hackathon Submission**  
**Team**: **Alchemy** | **Target Hardware**: **AMD Radeon PRO W7900D (48GB GDDR6 VRAM)**

[![AMD ROCm](https://img.shields.io/badge/AMD_ROCm-7.2.1-ED1C24?style=for-the-badge&logo=amd&logoColor=white)](https://www.amd.com/en/products/accelerators/instinct.html)
[![vLLM](https://img.shields.io/badge/vLLM-0.16.1.dev0-4B0082?style=for-the-badge&logo=python&logoColor=white)](https://github.com/vllm-project/vllm)
[![LangGraph](https://img.shields.io/badge/LangGraph-Parallel_State-FF6F00?style=for-the-badge&logo=langchain&logoColor=white)](https://github.com/langchain-ai/langgraph)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_RAG-DC2626?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Semgrep](https://img.shields.io/badge/Semgrep-SAST_Rules-00D2FF?style=for-the-badge&logo=semgrep&logoColor=black)](https://semgrep.dev/)
[![Rubric Alignment](https://img.shields.io/badge/Hackathon_Rubric-100%25_Verified-30D158?style=for-the-badge)](#-hackathon-rubric-alignment-matrix)

</div>

---

## 📌 Executive Summary

**THEMIS** is an enterprise-grade autonomous code review and security analysis platform powered by local open-weight LLMs (`Qwen2.5-Coder-32B-Instruct-AWQ`) running on **AMD Radeon PRO W7900D GPUs**. 

Unlike traditional static linters, THEMIS deploys a **parallel multi-agent state graph (LangGraph)** that orchestrates automated AST diff parsing, vector-based OWASP RAG retrieval, confidence-scored vulnerability verification, unified git patch synthesis, and **1-click automated GitHub Pull Request creation**.

---

## 🏗️ System Architecture

THEMIS operates via a 5-stage parallel agent workflow:

```text
                     ┌────────────────────────┐
                     │ 1. Triage Agent        │
                     │ (Diff Parser & Metadata│
                     └───────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
     ┌───────────────────────┐       ┌───────────────────────┐
     │ 2a. Security Agent    │       │ 2b. Style Agent       │
     │ - Semgrep / Bandit    │       │ - Complexity Check    │
     │ - Qdrant Vector RAG   │       │ - PEP8 & Formatting   │
     └───────────┬───────────┘       └───────────┬───────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 │  (Custom max_step reducer)
                                 ▼
                     ┌────────────────────────┐
                     │ 3. Verifier Agent      │
                     │ (Confidence Bounds &   │
                     │  CWE Validation)       │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │ 4. Fix Generator Agent │
                     │ (Synthesizes Patches & │
                     │  Opens GitHub PR)      │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │ 1-Click Automated PR   │
                     │ (POST /apply-fix)      │
                     └────────────────────────┘
```

---

## 📋 Prerequisites & Setup

Ensure the following tools are installed on your environment:
- **Python 3.11+**
- **Node.js 18+ & npm**
- **Git**

### 1. Environment Configuration
Copy the sample environment file to enable local configurations:
```bash
cp backend/.env.example backend/.env
```

### 2. Dependency Installation
```bash
# Backend dependencies
pip install -r backend/requirements.txt

# Frontend dependencies
cd frontend && npm install && cd ..
```

---

## ⚡ 1-Click Quickstart Guide for Judges

THEMIS offers **3 independent execution interfaces** tailored for quick judge verification.

### Mode A: Interactive Web Security Tribunal (GUI)

1. **Start Backend Server**:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8080
   ```

2. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:3000/review` and click **`⚡ Run Interactive Vulnerability Demo`**.
   - Watch live DAG step transitions: `Triage` → `Security` ∥ `Style` → `Verifier` → `Fix`.
   - Click **`Approve 2 Generated Patches`** to trigger live endpoint `POST /api/review/{job_id}/apply-fix` and view the clickable GitHub PR badge (`🔗 VIEW OPEN PULL REQUEST (11)`).

---

### Mode B: Rich Terminal UI (CLI / TUI)

1. **Run Interactive TUI Demo**:
   ```bash
   python -m backend.cli demo
   ```
   Renders a live terminal interface with animated scanning indicators, CWE findings table, and synthesized git patch diff viewer.

2. **Scan Live Custom GitHub Repository**:
   ```bash
   python -m backend.cli scan --repo octocat/Hello-World --pr 1
   ```

---

### Mode C: AMD ROCm Speculative Decoding Benchmark

1. **Run Performance Metrics Suite**:
   ```bash
   python benchmarks/rocm_benchmark.py
   ```
   Outputs structured performance comparison tables comparing baseline AWQ INT4 vs. speculative decoding (`Qwen2.5-Coder-1.5B` draft model).

2. **Run 10/10 OWASP Seeded Vulnerabilities Test Suite**:
   ```bash
   python tests/seeded_vulnerabilities.py
   ```

---

## 🚀 AMD Radeon W7900D & Speculative Decoding Benchmarks

THEMIS leverages **vLLM speculative decoding** on AMD ROCm 7.2.1 hardware stack to achieve real-time streaming reviews:

- **Target Hardware**: AMD Radeon PRO W7900D (48GB GDDR6 VRAM, 192 Compute Units)
- **Main Engine Model**: `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ`
- **Speculative Draft Model**: `Qwen/Qwen2.5-Coder-1.5B-Instruct` (`--num-speculative-tokens 5`)

| Metric | Standard AWQ INT4 | Speculative (1.5B Draft) | Performance Gain |
|---|---|---|---|
| **Avg Throughput (tok/s)** | `3.6 tok/s` | `9.2 tok/s` | **⚡ 2.56× Speedup** |
| **Time to First Token (TTFT)** | `1298 ms` | `884 ms` | **31.8% Faster** |
| **VRAM Footprint** | `37.2 GB / 48 GB` | `39.8 GB / 48 GB` | **Stable (0.80 Utilization)** |
| **ROCm Backend Engine** | `ROCM_AITER_FA` | `ROCM_AITER_FA` | **Flash Attention 2** |

---

## ⚠️ What to Avoid & Common Mistakes (Troubleshooting)

| Common Issue | Cause | Corrective Solution |
|---|---|---|
| `UnicodeEncodeError: 'charmap'` on Windows | Legacy Windows cmd stdout cannot encode emojis | Add `sys.stdout.reconfigure(encoding='utf-8')` early in Python scripts |
| `vLLM: Speculative decoding rejection` | vLLM 0.16.1 V1 engine incompatible with draft model | Set environment variable `export VLLM_USE_V1=0` before launching server |
| `InvalidUpdateError: At key 'step_count'` | Parallel LangGraph nodes returning unannotated state | Annotate key in `TypedDict` with custom reducer: `step_count: Annotated[int, max_step]` |
| `GitHub API 403 Forbidden` | Expired or unprivileged Fine-grained PAT | Ensure `GITHUB_TOKEN` in `backend/.env` has `repo` write permissions |

---

## ❓ Frequently Asked Questions (FAQ)

#### Q1: Can THEMIS run offline without an active cloud GPU attached?
> **Yes.** THEMIS includes an offline Standalone Demo Mode (`⚡ Run Interactive Vulnerability Demo`) that uses static rule heuristics and pre-compiled diff vectors to demonstrate the full multi-agent pipeline and 1-click PR creation.

#### Q2: How does THEMIS eliminate LLM false positives?
> The **Verifier Agent** cross-references static analysis findings (Semgrep/Bandit) against Qdrant vector similarity embeddings and enforces strict confidence bounds (>0.85). Any unverified finding is automatically filtered out.

#### Q3: Does THEMIS modify original PR branches directly?
> **No.** Following security best practices, THEMIS creates an isolated patch branch (e.g. `themis/patch-cwe-remediation`) and submits a separate Pull Request for human review before code is merged.

#### Q4: What programming languages are supported?
> THEMIS provides native static analysis rules, RAG vector embeddings, and patch generators for **Python**, **JavaScript/TypeScript**, **Go**, **Java**, and **C/C++**.

---

## 📋 Hackathon Rubric Alignment Matrix

| Evaluation Category | Key Rubric Criteria | Verification & Technical Evidence |
|---|---|---|
| **1. Innovation & Agentic Architecture** | Parallel state execution & multi-agent coordination | LangGraph state graph with custom `max_step` reducer in [`backend/agents/types.py`](file:///C:/Users/USER/Desktop/DevMaster/themis/backend/agents/types.py) |
| **2. Technical Implementation & AMD ROCm** | Hardware acceleration & throughput optimization | vLLM Speculative Decoding script (`vllm_speculative_deploy.sh`) + 2.56× speedup benchmark suite in [`benchmarks/rocm_benchmark.py`](file:///C:/Users/USER/Desktop/DevMaster/themis/benchmarks/rocm_benchmark.py) |
| **3. Practical Utility & Security Impact** | End-to-end vulnerability remediation & workflow integration | Automated OWASP/CWE patch synthesis + 1-click GitHub PR creation endpoint (`POST /api/review/{job_id}/apply-fix`) |
| **4. User Experience & Presentation** | Intuitive UI/UX, real-time feedback, and CLI/TUI accessibility | React dashboard with visual DAG stepper, telemetry console, Rich TUI (`python -m backend.cli demo`), and PR badges |

---

<div align="center">
  <b>Built with ❤️ by Team Alchemy for the AMD AI DevMaster Hackathon</b>
</div>
