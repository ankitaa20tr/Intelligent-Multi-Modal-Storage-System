FROM python:3.12-slim

WORKDIR /app

# Install system packages for Pillow

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    libjpeg-dev zlib1g-dev libpng-dev libtiff-dev libwebp-dev \
    && rm -rf /var/lib/apt/lists/*


    COPY requirements.txt .
    RUN pip install --upgrade pip setuptools wheel
    RUN pip install -r requirements.txt
    

COPY . .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

