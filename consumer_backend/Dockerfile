# Use the official Python image from the Docker Hub
FROM python:3.10

# Set environment variables to prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir -r /code/requirements.txt

# Set the working directory
WORKDIR /code

# Copy the Django project code
COPY . /code

# Expose the port that daphne will run on
EXPOSE 8000

# Run Gunicorn
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "mysite.asgi:application"]