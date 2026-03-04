# ENTRYPOINT - for production
# cmd -> gunicorn -k gevent -w 1 wsgi:app

from app import create_app
app = create_app()