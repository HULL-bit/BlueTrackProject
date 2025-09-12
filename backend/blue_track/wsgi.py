"""
WSGI config for BLUE-TRACK project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blue_track.settings')

application = get_wsgi_application()