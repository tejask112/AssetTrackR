from flask import Blueprint, request, jsonify

from ....utils.payload_validations import validate_portfolio_summary_payload

from ....ai_services.gemini_service import get_summary

bp = Blueprint("ai_portfolio_summary", __name__)

@bp.route("/summary", methods=["GET"])
def summary():
    # allowed, error_message = validate_portfolio_summary_payload(request.args)

    # if not allowed:
    #     return jsonify({ "error": error_message }), 400
    
    try:
        summary = get_summary()
        return jsonify({ "summary": summary })

    except Exception as e:
        print(f"summary() - Exception raised: {str(e)}")
        return jsonify({ "error": "Internal Server Error" })