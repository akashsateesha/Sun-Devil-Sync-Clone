"""
ASU Sun Devil Central - Scraped Data
URL: https://sundevilcentral.eoss.asu.edu/web_app?id=24040&menu_id=56483&if=0&
Scraped on: 2025-11-20
"""

scraped_data = {
    "url": "https://sundevilcentral.eoss.asu.edu/web_app?id=24040&menu_id=56483&if=0&",
    "page_title": "Sun Devil Central At ASU",
    "scraped_date": "2025-11-20T15:32:48-07:00",
    
    "navigation": {
        "groups": "Groups",
        "events": "Events (2145 events)",
        "my_account": "My Account"
    },
    
    "my_groups": [
        "Indian Students' Association at ASU"
    ],
    
    "suggested_groups": [
        "BRASA at ASU",
        "Association of Latino Professionals For Am...",
        "The Pre-Law Society"
    ],
    
    "announcements": [
        {
            "title": "Sun Devils are back - we game day together!",
            "has_link": True
        },
        {
            "title": "Homecoming at ASU",
            "has_details": True,
            "has_links": True
        }
    ],
    
    "upcoming_events": [
        "Global Innovation Night",
        "Book Club for International Students",
        "The Poly Games"
    ],
    
    "funding_information": {
        "student_organization_appropriations": {
            "gso_event_funding": {
                "description": "GSO Event Funding packet",
                "has_deadline": True,
                "has_link": True
            },
            "operations_funding": {
                "description": "Operations Funding packet",
                "has_deadline": True,
                "has_link": True
            }
        },
        "professional_development_travel_grants": {
            "undergraduate_grants": {
                "research_grant": {
                    "description": "Undergraduate Research Grant",
                    "has_deadline": True,
                    "has_link": True
                },
                "travel_grant": {
                    "description": "Undergraduate Travel Grant",
                    "has_deadline": True,
                    "has_link": True
                }
            },
            "graduate_grants": {
                "research_grant": {
                    "description": "Graduate Research Grant",
                    "has_deadline": True,
                    "has_link": True
                },
                "travel_grant": {
                    "description": "Graduate Travel Grant",
                    "has_deadline": True,
                    "has_link": True
                }
            }
        }
    },
    
    "more_groups": "A long list of various student organizations and groups (full list available on page)",
    
    "page_features": {
        "has_pagination": True,
        "navigation_controls": ["previous", "next"],
        "requires_authentication": True,
        "authentication_method": "ASU SSO with Duo Security"
    }
}

# Access the data
if __name__ == "__main__":
    print("Scraped Data from ASU Sun Devil Central")
    print("=" * 50)
    print(f"\nPage Title: {scraped_data['page_title']}")
    print(f"URL: {scraped_data['url']}")
    print(f"\nMy Groups: {', '.join(scraped_data['my_groups'])}")
    print(f"\nSuggested Groups: {', '.join(scraped_data['suggested_groups'])}")
    print(f"\nUpcoming Events: {', '.join(scraped_data['upcoming_events'])}")
    print(f"\nAnnouncements: {len(scraped_data['announcements'])} announcements found")
    print(f"\nFunding Information: Available for both student organizations and professional development")
