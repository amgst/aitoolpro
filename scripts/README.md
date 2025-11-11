# Kaggle Data Import Script

This script imports AI tools data from the Kaggle dataset `shahmirkiani/ai-tools-data` and converts it to the format required by the AIToolKitv2 application.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. **Set up Kaggle API credentials:**
   - Go to https://www.kaggle.com/account and create an API token
   - Download `kaggle.json` 
   - Place it in `~/.kaggle/kaggle.json` (Linux/Mac) or `C:\Users\<username>\.kaggle\kaggle.json` (Windows)
   - Set permissions: `chmod 600 ~/.kaggle/kaggle.json` (Linux/Mac)

## Usage

Run the import script:

```bash
python scripts/import_kaggle_data.py
```

The script will:
1. Download the Kaggle dataset
2. Map the columns to match the application schema
3. Export to CSV format (`data/kaggle_import.csv`) - ready for admin panel import
4. Export to JSON format (`data/kaggle_import.json`) - for direct reference

## Importing the Data

### Option 1: Via Admin Panel (Recommended)
1. Start your server: `npm run dev`
2. Navigate to: http://localhost:5000/admin/import
3. Upload the `data/kaggle_import.csv` file
4. The tools will be imported automatically

### Option 2: Direct JSON Merge
You can manually merge `data/kaggle_import.json` with `data/tools.json` if needed.

## Customization

If the Kaggle dataset structure differs from expected, edit `scripts/import_kaggle_data.py` and update the `map_kaggle_to_schema()` function to match your dataset's column names.

## Troubleshooting

- **"Dataset not found"**: Verify the dataset name is correct
- **"Authentication error"**: Check your Kaggle API credentials
- **"Column not found"**: The dataset structure may differ - update the mapping function
- **Import errors**: Check the CSV format matches the expected schema

