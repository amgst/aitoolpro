#!/usr/bin/env python3
"""
Import AI Tools data from Kaggle dataset and convert to CSV/JSON format
for the AIToolKitv2 application.

Usage:
    python scripts/import_kaggle_data.py

Requirements:
    pip install kagglehub[pandas-datasets] pandas
"""

import kagglehub
import pandas as pd
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# Set the Kaggle dataset path
KAGGLE_DATASET = "shahmirkiani/ai-tools-data"
OUTPUT_DIR = Path(__file__).parent.parent / "data"
CSV_OUTPUT = OUTPUT_DIR / "kaggle_import.csv"
JSON_OUTPUT = OUTPUT_DIR / "kaggle_import.json"


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    if pd.isna(text) or not text:
        return ""
    # Convert to lowercase and replace spaces/special chars with hyphens
    text = str(text).lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def parse_list(value: Any, separator: str = ",") -> List[str]:
    """Parse a string or list into a list of strings."""
    if pd.isna(value) or not value:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if v]
    # Handle string values
    return [v.strip() for v in str(value).split(separator) if v.strip()]


def parse_pricing(value: Any) -> str:
    """Normalize pricing information."""
    if pd.isna(value) or not value:
        return "Unknown"
    
    value_str = str(value).lower()
    if "free" in value_str:
        return "Free"
    elif "freemium" in value_str:
        return "Freemium"
    elif "paid" in value_str or "$" in value_str:
        return "Paid"
    elif "enterprise" in value_str:
        return "Enterprise"
    else:
        return str(value).strip()


def map_kaggle_to_schema(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Map Kaggle dataset columns to the application schema.
    
    Expected schema fields:
    - slug, name, description, shortDescription, category, pricing, 
      websiteUrl, logoUrl, features, tags, badge, rating, developer, 
      documentationUrl, socialLinks, useCases, pricingDetails, launchDate, lastUpdated
    """
    tools = []
    
    for _, row in df.iterrows():
        tool: Dict[str, Any] = {}
        
        # Required fields
        tool["name"] = str(row.get("name", row.get("title", ""))).strip()
        if not tool["name"]:
            continue  # Skip rows without names
        
        tool["slug"] = slugify(row.get("slug", tool["name"]))
        tool["description"] = str(row.get("description", row.get("desc", ""))).strip()
        tool["shortDescription"] = str(row.get("shortDescription", row.get("short_desc", tool["description"][:100]))).strip()
        tool["category"] = str(row.get("category", row.get("categories", "Other"))).strip()
        tool["pricing"] = parse_pricing(row.get("pricing", row.get("price", "")))
        tool["websiteUrl"] = str(row.get("websiteUrl", row.get("url", row.get("website", "")))).strip()
        
        # Optional fields
        tool["logoUrl"] = str(row.get("logoUrl", row.get("logo", ""))).strip() or None
        tool["badge"] = str(row.get("badge", "")).strip() or None
        tool["developer"] = str(row.get("developer", row.get("author", ""))).strip() or None
        tool["documentationUrl"] = str(row.get("documentationUrl", row.get("docs", ""))).strip() or None
        
        # Rating (ensure it's between 0-5)
        rating = row.get("rating", row.get("score", None))
        if pd.notna(rating):
            try:
                rating_val = float(rating)
                tool["rating"] = max(0, min(5, rating_val))
            except (ValueError, TypeError):
                tool["rating"] = None
        else:
            tool["rating"] = None
        
        # Arrays (features, tags)
        tool["features"] = parse_list(row.get("features", row.get("feature", "")))
        tool["tags"] = parse_list(row.get("tags", row.get("tag", "")))
        
        # Use cases
        use_cases = row.get("useCases", row.get("use_cases", row.get("use_case", "")))
        tool["useCases"] = parse_list(use_cases) if use_cases else None
        
        # Social links
        social_links = {}
        if pd.notna(row.get("twitter")):
            social_links["twitter"] = str(row.get("twitter")).strip()
        if pd.notna(row.get("github")):
            social_links["github"] = str(row.get("github")).strip()
        if pd.notna(row.get("linkedin")):
            social_links["linkedin"] = str(row.get("linkedin")).strip()
        if pd.notna(row.get("discord")):
            social_links["discord"] = str(row.get("discord")).strip()
        tool["socialLinks"] = social_links if social_links else None
        
        # Pricing details
        pricing_details = {}
        if pd.notna(row.get("pricing_free")):
            pricing_details["free"] = str(row.get("pricing_free")).strip()
        if pd.notna(row.get("pricing_starter")):
            pricing_details["starter"] = str(row.get("pricing_starter")).strip()
        if pd.notna(row.get("pricing_pro")):
            pricing_details["pro"] = str(row.get("pricing_pro")).strip()
        if pd.notna(row.get("pricing_enterprise")):
            pricing_details["enterprise"] = str(row.get("pricing_enterprise")).strip()
        tool["pricingDetails"] = pricing_details if pricing_details else None
        
        # Dates
        tool["launchDate"] = str(row.get("launchDate", row.get("launch_date", ""))).strip() or None
        tool["lastUpdated"] = datetime.now().strftime("%Y-%m-%d")
        
        # Remove None values for cleaner JSON
        tool = {k: v for k, v in tool.items() if v is not None and v != ""}
        
        tools.append(tool)
    
    return tools


def export_to_csv(tools: List[Dict[str, Any]], output_path: Path):
    """Export tools to CSV format compatible with the import endpoint."""
    # Define CSV columns (matching the expected format)
    csv_columns = [
        "slug", "name", "description", "shortDescription", "category", 
        "pricing", "websiteUrl", "logoUrl", "features", "tags", 
        "badge", "rating", "developer", "documentationUrl"
    ]
    
    rows = []
    for tool in tools:
        row = {}
        for col in csv_columns:
            value = tool.get(col, "")
            if col == "features" or col == "tags":
                # Join arrays with pipe separator
                row[col] = "|".join(value) if isinstance(value, list) else str(value)
            else:
                row[col] = str(value) if value else ""
        rows.append(row)
    
    df_csv = pd.DataFrame(rows, columns=csv_columns)
    df_csv.to_csv(output_path, index=False)
    print(f"✓ Exported {len(tools)} tools to CSV: {output_path}")


def export_to_json(tools: List[Dict[str, Any]], output_path: Path):
    """Export tools to JSON format matching the application schema."""
    # Add IDs to each tool (UUIDs will be generated by the app, but we can add placeholders)
    for tool in tools:
        if "id" not in tool:
            # Generate a simple ID (the app will use UUIDs)
            tool["id"] = f"kaggle-{slugify(tool.get('name', ''))}"
    
    output_path.write_text(json.dumps(tools, indent=2, ensure_ascii=False))
    print(f"✓ Exported {len(tools)} tools to JSON: {output_path}")


def main():
    """Main function to load Kaggle data and convert it."""
    print(f"Loading Kaggle dataset: {KAGGLE_DATASET}")
    print("=" * 60)
    
    try:
        # Load the dataset
        # Note: You may need to specify the file_path if the dataset has multiple files
        # For example: file_path = "ai_tools.csv" or file_path = "data.csv"
        df = kagglehub.load_dataset(
            kagglehub.KaggleDatasetAdapter.PANDAS,
            KAGGLE_DATASET,
            file_path="",  # Empty string loads the default file, or specify the CSV file name
        )
        
        print(f"✓ Loaded dataset with {len(df)} rows")
        print(f"✓ Columns: {', '.join(df.columns.tolist())}")
        print()
        
        # Show first few rows
        print("First 3 rows preview:")
        print(df.head(3).to_string())
        print()
        
        # Map to application schema
        print("Mapping to application schema...")
        tools = map_kaggle_to_schema(df)
        print(f"✓ Mapped {len(tools)} tools")
        print()
        
        # Create output directory
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Export to CSV (for import via admin panel)
        export_to_csv(tools, CSV_OUTPUT)
        
        # Export to JSON (for direct import or backup)
        export_to_json(tools, JSON_OUTPUT)
        
        print()
        print("=" * 60)
        print("Import completed successfully!")
        print()
        print("Next steps:")
        print(f"1. Review the CSV file: {CSV_OUTPUT}")
        print(f"2. Import via Admin Panel: http://localhost:5000/admin/import")
        print(f"   - Upload the CSV file using the import interface")
        print(f"3. Or manually merge JSON: {JSON_OUTPUT}")
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("Troubleshooting:")
        print("1. Make sure you have Kaggle credentials set up:")
        print("   - Create ~/.kaggle/kaggle.json with your API credentials")
        print("2. Install required packages:")
        print("   pip install kagglehub[pandas-datasets] pandas")
        print("3. Check if the dataset name is correct")
        raise


if __name__ == "__main__":
    main()

