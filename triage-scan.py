import json, sys
from datetime import datetime, timezone

issues_raw = json.loads(sys.stdin.read())
now = datetime.now(timezone.utc)

def categorize(issue):
    labels = issue["labels"]
    title = issue["title"].lower()
    
    # Priority
    if any(x in labels for x in ["support: premium standard"]):
        priority = "high"
    elif any(x in labels for x in ["support: pro standard"]):
        priority = "medium"
    else:
        priority = "normal"
    
    # Age in days
    created = datetime.fromisoformat(issue["created_at"].replace("Z","+00:00"))
    updated = datetime.fromisoformat(issue["updated_at"].replace("Z","+00:00"))
    age_days = (now - created).days
    stale_days = (now - updated).days
    
    if age_days > 21:
        priority = "high"  # old issues need attention
    
    # Component
    component = "unknown"
    for l in labels:
        if "data grid" in l: component = "data-grid"; break
        if "pickers" in l: component = "pickers"; break
        if "charts" in l: component = "charts"; break
        if "tree view" in l: component = "tree-view"; break
    
    # Type
    issue_type = "bug"
    if "docs" in labels: issue_type = "docs"
    elif "feature" in " ".join(labels).lower() or "question" in title: issue_type = "feature-request"
    elif "vulnerability" in title or "csp" in title or "redos" in title: issue_type = "security"
    
    return {
        "number": issue["number"],
        "title": issue["title"],
        "user": issue["user"],
        "url": issue["html_url"],
        "component": component,
        "type": issue_type,
        "priority": priority,
        "ageDays": age_days,
        "staleDays": stale_days,
        "labels": labels,
        "createdAt": issue["created_at"],
        "updatedAt": issue["updated_at"],
    }

triaged = [categorize(i) for i in issues_raw]
triaged.sort(key=lambda x: {"high":0,"medium":1,"normal":2}[x["priority"]])

result = {
    "lastScan": now.isoformat(),
    "totalCount": len(triaged),
    "byPriority": {
        "high": len([i for i in triaged if i["priority"]=="high"]),
        "medium": len([i for i in triaged if i["priority"]=="medium"]),
        "normal": len([i for i in triaged if i["priority"]=="normal"]),
    },
    "byComponent": {},
    "issues": triaged,
}

for i in triaged:
    c = i["component"]
    result["byComponent"][c] = result["byComponent"].get(c, 0) + 1

json.dump(result, sys.stdout, indent=2)
