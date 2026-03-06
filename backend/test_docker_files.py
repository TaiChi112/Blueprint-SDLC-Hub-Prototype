#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick verification that Docker setup files are created correctly"""

from pathlib import Path
import json
import yaml

base_dir = Path(__file__).parent

files_to_check = {
    "docker-compose.yml": "YAML",
    "init.sql": "SQL",
    ".env": "ENV",
    "DOCKER_SETUP.md": "MARKDOWN",
    "docker-setup.sh": "BASH",
}

print("[CHECK] Checking Docker setup files...\n")

all_good = True
for filename, file_type in files_to_check.items():
    filepath = base_dir / filename
    if filepath.exists():
        size = filepath.stat().st_size
        print(f"✅ {filename:25} ({file_type:10}) - {size:,} bytes")
    else:
        print(f"❌ {filename:25} (MISSING)")
        all_good = False

print()

# Try loading docker-compose.yml
try:
    import yaml
    with open(base_dir / "docker-compose.yml") as f:
        compose = yaml.safe_load(f)
    services = list(compose.get("services", {}).keys())
    print(f"✅ docker-compose.yml is valid YAML")
    print(f"   Services: {', '.join(services)}")
except Exception as e:
    print(f"❌ docker-compose.yml error: {e}")
    all_good = False

print()

# Check .env
try:
    with open(base_dir / ".env") as f:
        env_lines = [line for line in f if line.strip() and not line.startswith("#")]
    print(f"✅ .env file is valid")
    print(f"   Configuration variables: {len(env_lines)}")
    for line in env_lines[:3]:
        key = line.split("=")[0]
        print(f"   - {key}")
except Exception as e:
    print(f"❌ .env error: {e}")
    all_good = False

print()

if all_good:
    print("✨ All Docker setup files are ready!")
else:
    print("⚠️  Some files are missing or invalid")

