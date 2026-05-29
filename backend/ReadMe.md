# 1. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up PostgreSQL database
# Run the SQL commands provided above in your PostgreSQL client

# 4. Configure environment variables
# Create .env file with your database URL

# 5. Run the application
python run.py

# 6. Access Swagger documentation
# Open browser to http://localhost:8000/docs