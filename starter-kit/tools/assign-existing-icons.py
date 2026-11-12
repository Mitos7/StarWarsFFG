"""Apply the existing-artwork catalog and preserve Tokenizer 2 compositions."""
from pathlib import Path
import subprocess
subprocess.run(["node", str(Path(__file__).with_name("apply-starwars-images.cjs"))], check=True)
