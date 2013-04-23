import json

from django.http import HttpResponse

def json_response(request_fn):
    """Decorator for requests that should have a json response.
    """

    def _json_response_fn(*args, **kwargs):
      result = request_fn(*args, **kwargs)
      return HttpResponse(json.dumps(result), mimetype="application/json")

    return _json_response_fn
