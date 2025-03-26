import os
import requests
import json

class ScriboHandler():
    def __init__(self):
        self.api_address = os.environ.get('REACT_APP_HUGGINGFACE_ADDRESS')

    def generate_page(self, data):
        return """# Introduction to Customer Service

**Estimated Reading Time: 10 minutes**

## Introduction
Customer service is a vital component of any business, aiming to enhance customer satisfaction and foster a positive relationship with its clientele. This module will provide a detailed overview of customer service, its importance, and practical examples of effective implementation. Understanding the nuances of customer service can significantly impact a company's success and reputation.

## Key Concepts
- Definition of customer service
- Importance of customer service

## Explanation
Customer service refers to the support provided by a company to its customers throughout the entire customer journey, from pre-sales inquiries to post-purchase support. This support is crucial for addressing customer needs, resolving issues, and ensuring overall satisfaction. Customer service can take various forms, including phone calls, emails, live chat, and in-person interactions in physical stores.

### Definition of Customer Service
Customer service encompasses a wide range of activities designed to assist and satisfy customers. These activities can be categorized into three main phases:
- **Pre-Sales Support:** Before a customer makes a purchase, they often have questions about products or services. Pre-sales support involves providing detailed information, addressing queries, and guiding customers to make informed decisions. This phase is critical for building trust and establishing a positive first impression.
- **Sales Support:** During the purchasing process, customers may require assistance with placing orders, selecting the right products, or navigating the website or store. Sales support ensures that customers have a smooth and efficient transaction, which can enhance their overall experience and increase the likelihood of repeat business.
- **Post-Sales Support:** After a purchase, customers may encounter issues or have further questions. Post-sales support includes troubleshooting, handling returns or exchanges, and gathering feedback to improve future interactions. This phase is crucial for maintaining customer loyalty and addressing any concerns that could impact their satisfaction.

### Importance of Customer Service
Effective customer service is not just a cost center but a strategic asset that can drive business growth and success. Here are several reasons why customer service is crucial:
- **Customer Retention:** High-quality customer service can significantly increase customer loyalty. When customers feel valued and supported, they are more likely to return and make repeat purchases. This leads to higher sales and increased profitability over time.
- **Positive Word-of-Mouth:** Satisfied customers often recommend a business to friends, family, and colleagues. Positive word-of-mouth can attract new customers and expand a company’s market reach without the need for additional marketing spend.
- **Competitive Advantage:** In a crowded market, customer service can be a key differentiator. A business that offers exceptional service can stand out from competitors, creating a loyal customer base and improving its market position.
- **Brand Reputation:** Consistently positive customer service experiences can enhance a company’s reputation. Positive reviews and testimonials can attract more customers and make the company more appealing to potential employees. Conversely, poor service can quickly damage a brand’s image and lead to customer churn.
- **Feedback and Continuous Improvement:** Customer service provides valuable feedback that can be used to improve products, services, and internal processes. Regularly addressing these issues based on customer feedback can lead to more effective operations and better customer satisfaction over time. This continuous cycle of improvement is essential for staying relevant and competitive.

## Examples
### Scenario 1: Issue Resolution
Consider a customer who has purchased a laptop online but is experiencing technical difficulties. The company’s customer service team is well-equipped to handle such issues. They provide a comprehensive troubleshooting guide via email and have a dedicated support line for more complex problems. If the issue cannot be resolved, they promptly arrange for a return and replacement, ensuring the customer's satisfaction and maintaining a positive brand reputation.

### Scenario 2: Proactive Support
An online clothing retailer uses live chat to provide immediate assistance to customers browsing their website. The chat team offers personalized recommendations based on customer preferences, helps with sizing and fit questions, and guides customers through the purchasing process. This proactive approach ensures that customers feel supported and valued, leading to a more enjoyable shopping experience and higher customer retention rates.

### Scenario 3: Feedback Collection and Improvement
A restaurant has a robust feedback collection system where customers can rate their dining experience through an online form or directly to the staff. This feedback is systematically analyzed to identify areas for improvement, such as food quality, service speed, and ambiance. Regularly addressing these issues based on customer feedback can significantly enhance the overall dining experience and customer loyalty. For instance, if customers consistently mention that the wait times are too long, the restaurant might invest in additional staff or streamline its order process to reduce wait times.

### Scenario 4: Personalized Experience
A luxury hotel chain provides personalized customer service to ensure that guests have a memorable experience. This includes personalized greetings, tailored room preferences, and on-demand assistance throughout their stay. By going above and beyond to meet individual needs, the hotel can create a loyal customer base that is more likely to return and recommend the hotel to others.

### Scenario 5: Efficient Handling of Complaints
A telecommunications company has a well-structured complaint handling system. When a customer calls to report an issue, the service representative listens attentively, provides a solution, and follows up to ensure the problem is resolved. This efficient and empathetic approach not only addresses the immediate concern but also helps build trust and confidence in the brand.

## Summary
Effective customer service is essential for any business aiming to thrive in today’s competitive market. It involves proactive and reactive support across the customer journey, from pre-sales inquiries to post-purchase issues. High-quality customer service can lead to better customer retention, positive word-of-mouth, a competitive advantage, enhanced brand reputation, and valuable feedback for continuous improvement. By investing in customer service, businesses can create loyal customers and improve their overall operations, ensuring long-term success and growth.
        """
    

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

        print("inside update course outline")
        print(data)
        
        response = requests.post(url, json=data)

        data = response.json()

        course_outline = data.get("response",  {}).get("output_validator", {}).get("valid_replies", [])

        return json.loads(course_outline)