"""
THEMIS Command Line & Terminal UI (TUI) Interface
Provides developers & security engineers with rich terminal execution, live DAG progress,
ANSI-formatted vulnerability cards, and synthesized patch diffs.

Usage:
  python -m backend.cli demo
  python -m backend.cli scan --repo owner/repo --pr 1
  python -m backend.cli benchmark
"""

import sys
import time
import os
import argparse
import urllib.request
import json
from typing import Optional

# Force UTF-8 stdout for Windows terminals
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.syntax import Syntax

console = Console(force_terminal=True)

BANNER = """
[bold red]╔════════════════════════════════════════════════════════════════════════════╗[/bold red]
[bold red]║[/bold red]  [bold white]⚖️ THEMIS TRIBUNAL — Autonomous Multi-Agent Code Review & Security[/bold white]  [bold red]║[/bold red]
[bold red]║[/bold red]  [dim white]Powered by AMD ROCm + Qwen2.5-Coder-32B + Qdrant RAG Engine[/dim white]             [bold red]║[/bold red]
[bold red]╚════════════════════════════════════════════════════════════════════════════╝[/bold red]
"""

SAMPLE_FINDINGS = [
    {
        "agent": "security",
        "category": "security",
        "severity": "CRITICAL",
        "cwe_id": "CWE-89",
        "title": "SQL Injection via Unsanitized Request Parameter",
        "file": "app/controllers/user_controller.py:42",
        "confidence": 0.96,
        "description": "Raw string concatenation in SQL query allows remote attacker to execute arbitrary SQL commands.",
        "evidence": "query = f\"SELECT * FROM users WHERE username = '{user_input}'\"\ncursor.execute(query)"
    },
    {
        "agent": "security",
        "category": "security",
        "severity": "HIGH",
        "cwe_id": "CWE-798",
        "title": "Hardcoded Cryptographic Secret Key",
        "file": "app/config/auth.py:14",
        "confidence": 0.92,
        "description": "API secret key committed directly in source code.",
        "evidence": 'SECRET_KEY = "MOCK_SECRET_KEY_EX_84920491"'
    },
    {
        "agent": "style",
        "category": "quality",
        "severity": "MEDIUM",
        "cwe_id": "CWE-1078",
        "title": "Unused Global Variable in Utility Helper",
        "file": "app/utils/helpers.py:28",
        "confidence": 0.88,
        "description": "Dead code variable allocation in helper routine.",
        "evidence": 'def calculate_hash(data):\n    temp_token = "unused"\n    return hashlib.sha256(data).hexdigest()'
    }
]

SAMPLE_PATCHES = [
    {
        "file": "app/controllers/user_controller.py",
        "diff": """@@ -40,4 +40,4 @@
-query = f"SELECT * FROM users WHERE username = '{user_input}'"
-cursor.execute(query)
+query = "SELECT * FROM users WHERE username = %s"
+cursor.execute(query, (user_input,))"""
    },
    {
        "file": "app/config/auth.py",
        "diff": """@@ -12,3 +12,3 @@
-SECRET_KEY = "MOCK_SECRET_KEY_EX_84920491"
+SECRET_KEY = os.environ.get("AUTH_SECRET_KEY")"""
    }
]


def run_terminal_demo():
    """Run an interactive TUI security audit demo in the terminal."""
    console.clear()
    console.print(BANNER)

    console.print("[bold yellow]⚡ Initializing Interactive Vulnerability Audit Demo...[/bold yellow]\n")

    agents = [
        ("🗂️ Triage Agent", "Diff parsing, language classification & risk prioritization"),
        ("🛡️ Security Agent", "Semgrep (Docker) + Bandit (Docker) + Qdrant RAG (OWASP/CWE)"),
        ("🎨 Style Agent", "Pylint (Docker) + ESLint (Docker) + PEP8 maintainability"),
        ("⚖️ Verifier Agent", "Multi-agent confidence scoring & false positive reduction"),
        ("🔧 Fix Generator", "Unified git patch synthesis & human-in-the-loop preparation"),
    ]

    with Progress(
        SpinnerColumn(spinner_name="dots"),
        TextColumn("[bold cyan]{task.description}[/bold cyan]"),
        BarColumn(bar_width=30),
        TextColumn("[bold green]{task.percentage:>3.0f}%[/bold green]"),
        TimeElapsedColumn(),
        console=console
    ) as progress:
        for name, desc in agents:
            task = progress.add_task(f"{name} ({desc})", total=100)
            for _ in range(10):
                time.sleep(0.12)
                progress.update(task, advance=10)

    console.print("\n[bold green]✅ TRIBUNAL VERDICT RENDERED[/bold green]\n")

    # Render Findings Table
    table = Table(title="🛡️ Verified Security & Quality Findings", border_style="bright_blue", show_lines=True)
    table.add_column("Severity", style="bold red", justify="center")
    table.add_column("CWE Tag", style="bold cyan")
    table.add_column("Finding Title", style="bold white")
    table.add_column("Location", style="dim yellow")
    table.add_column("Confidence", justify="right", style="bold green")

    for f in SAMPLE_FINDINGS:
        sev_style = "bold red" if f["severity"] == "CRITICAL" else "bold orange3" if f["severity"] == "HIGH" else "bold yellow"
        table.add_row(
            f"[{sev_style}]{f['severity']}[/{sev_style}]",
            f["cwe_id"],
            f["title"],
            f["file"],
            f"{int(f['confidence'] * 100)}%"
        )

    console.print(table)
    console.print()

    # Render Patches
    console.print(Panel("[bold green]🔧 Synthesized Git Fix Patches[/bold green]", border_style="green"))
    for p in SAMPLE_PATCHES:
        console.print(f"\n[bold yellow]File: {p['file']}[/bold yellow]")
        syntax = Syntax(p["diff"], "diff", theme="monokai", line_numbers=True)
        console.print(syntax)

    console.print("\n[bold green]✨ Terminal demo execution complete![/bold green]\n")


def run_pr_scan(repo: str, pr_number: int, api_url: str = "http://localhost:8080"):
    """Run a live review scan against the backend API from CLI."""
    console.clear()
    console.print(BANNER)
    console.print(f"[bold cyan]🔍 Dispatching Tribunal Scan for [bold white]{repo}#{pr_number}[/bold white]...[/bold cyan]\n")

    # Submit job
    url = f"{api_url}/api/review/github"
    headers = {"Content-Type": "application/json", "X-API-Key": "themis-dev-key-change-in-prod"}
    body = json.dumps({"repo": repo, "pr_number": pr_number}).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers)

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            job_id = data["job_id"]
            console.print(f"[dim gray]Job ID: {job_id}[/dim gray]")

        # Poll status
        report_url = f"{api_url}/api/review/{job_id}/report"
        r_req = urllib.request.Request(report_url, headers={"X-API-Key": "themis-dev-key-change-in-prod"})

        with Progress(
            SpinnerColumn(spinner_name="moon"),
            TextColumn("[bold cyan]Scanning repository diff with 5-agent graph...[/bold cyan]"),
            TimeElapsedColumn(),
            console=console
        ) as progress:
            task = progress.add_task("scan", total=None)
            for _ in range(30):
                time.sleep(1.5)
                try:
                    with urllib.request.urlopen(r_req) as r_resp:
                        report = json.loads(r_resp.read().decode())
                        st = report.get("status")
                        if st in ("complete", "error"):
                            break
                except Exception:
                    pass

        if report.get("status") == "complete":
            findings = report.get("findings", [])
            patches = report.get("patches", [])
            console.print(f"\n[bold green]✅ Review Complete — {len(findings)} Findings, {len(patches)} Patches[/bold green]\n")

            if findings:
                table = Table(title="🛡️ Security Findings", border_style="red")
                table.add_column("Severity")
                table.add_column("CWE")
                table.add_column("Title")
                table.add_column("Location")
                for f in findings:
                    table.add_row(f.get("severity", "LOW"), f.get("cwe_id", "N/A"), f.get("title", ""), f.get("file", ""))
                console.print(table)
            else:
                console.print("[bold green]✨ No critical vulnerabilities detected! Clean security check.[/bold green]")
        else:
            console.print(f"[bold red]❌ Analysis error: {report.get('error')}[/bold red]")

    except Exception as e:
        console.print(f"[bold red]❌ Connection error: {e}[/bold red]")
        console.print("[yellow]Ensure backend is running: conda run -n themis uvicorn backend.main:app --port 8080[/yellow]")


def run_benchmark_check(api_url: str = "http://localhost:8080"):
    """Check AMD GPU & vLLM health metrics from CLI."""
    console.print(BANNER)
    console.print("[bold cyan]📊 Querying AMD Telemetry & vLLM Inference Engine...[/bold cyan]\n")

    try:
        url = f"{api_url}/api/benchmark/health"
        with urllib.request.urlopen(url) as resp:
            data = json.loads(resp.read().decode())
            console.print(Panel(json.dumps(data, indent=2), title="AMD ROCm vLLM Status", border_style="green"))
    except Exception as e:
        console.print(f"[bold red]❌ Health check failed: {e}[/bold red]")


def main():
    parser = argparse.ArgumentParser(description="THEMIS Command Line Interface & TUI")
    subparsers = parser.add_subparsers(dest="command")

    demo_parser = subparsers.add_parser("demo", help="Run interactive TUI demo")

    scan_parser = subparsers.add_parser("scan", help="Scan a GitHub repository PR")
    scan_parser.add_argument("--repo", default="octocat/Hello-World", help="GitHub repo owner/name")
    scan_parser.add_argument("--pr", type=int, default=1, help="PR number")

    bench_parser = subparsers.add_parser("benchmark", help="Check vLLM AMD GPU benchmark health")

    args = parser.parse_args()

    if args.command == "demo" or not args.command:
        run_terminal_demo()
    elif args.command == "scan":
        run_pr_scan(args.repo, args.pr)
    elif args.command == "benchmark":
        run_benchmark_check()


if __name__ == "__main__":
    main()
