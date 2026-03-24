import requests
import json
import urllib.request
import os

url = "http://127.0.0.1:8000/api/analyze"

job_description = """
Requirements:
- Strong knowledge of Python and FastAPI
- Experience with Docker containers and CI/CD pipelines
- Working knowledge of AWS or other cloud providers
- Front-end experience with React is a plus
"""

pdf_path = "sample_resume.pdf"
if not os.path.exists(pdf_path):
    print("Downloading a sample dummy PDF...")
    urllib.request.urlretrieve("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", pdf_path)

try:
    with open(pdf_path, "rb") as f:
        files = {"resume": ("sample_resume.pdf", f, "application/pdf")}
        data = {"job_description": job_description}
        
        print(f"Sending request to {url}...")
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            print("\nAnalysis Result:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error {response.status_code}: {response.text}")
except FileNotFoundError:
    print("Please place a 'sample_resume.pdf' file in this directory to run the test script.")
