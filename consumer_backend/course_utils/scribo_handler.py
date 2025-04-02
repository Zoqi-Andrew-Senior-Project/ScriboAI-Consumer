import os
import requests
import json

class ScriboHandler():
    def __init__(self):
        self.api_address = os.environ.get('REACT_APP_HUGGINGFACE_ADDRESS')

    def generate_page(self, data):
        url = self.api_address + '/generate-module-content'

        data = data

        response = requests.post(url, json=data)

        content = response.get('response').get(data.title)
        return content
    

    def generate_course_outline(self, data):
        if data.get('topic') is None:
            raise Exception('No topic provided')
        if data.get('time') is None:
            raise Exception('No duration provided')
        
        url = self.api_address + '/generate-outline'
        
        response = requests.post(url, json=data)

        data = response.json()

        course_outline = data.get("response").get("output_validator").get("valid_replies")

        return json.loads(course_outline)
    
    def update_course_outline(self, data):
        """Body:

        {
            script: string,
            comments: string
        }"""
        if data.get('script') is None:
            raise Exception('No script provided.')
        if data.get('notes') is None:
            raise Exception('No notes are provided')
        
        url = self.api_address + '/update-outline'
        
        response = requests.post(url, json=data)

        data = response.json()

        course_outline = data.get("response",  {}).get("output_validator", {}).get("valid_replies", [])

        return json.loads(course_outline)