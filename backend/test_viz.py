import requests
import json

resp = requests.post("http://localhost:8000/api/visualize-spec", json={
    "userId": "test",
    "specId": "spec_2026-03-04-01-54-26-851830.json",
    "diagramTypes": ["excalidraw"]
})
data = resp.json()
elements = data['diagram'].get('elements', [])
print(f"Total elements: {len(elements)}")

if elements:
    rect = next((e for e in elements if e['type'] == 'rectangle'), None)
    if rect:
        print(f"\nRectangle element fields:")
        print(f"   id: {rect.get('id')}")
        print(f"   type: {rect.get('type')}")
        print(f"   seed: {rect.get('seed')}")
        print(f"   versionNonce: {rect.get('versionNonce')}")
        print(f"   Total fields: {len(rect)}")

    line = next((e for e in elements if e['type'] == 'line'), None)
    if line:
        print(f"\nLine element:")
        print(f"   type: {line.get('type')}")
        print(f"   points: {line.get('points')}")
