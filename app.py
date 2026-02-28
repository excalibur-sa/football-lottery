import os
from flask import Flask, render_template, jsonify, request, send_from_directory
from api import get_data_provider
from services.match_service import MatchService
from services.excel_service import generate_excel
import config

app = Flask(__name__)

provider = get_data_provider()
match_service = MatchService(provider)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/matches')
def api_matches():
    try:
        date = request.args.get('date')  # 可选日期参数 YYYY-MM-DD
        matches = match_service.get_today_matches(date=date)
        return jsonify({"success": True, "count": len(matches), "matches": matches})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/matches/<match_id>/odds')
def api_match_odds(match_id):
    try:
        detail = match_service.get_match_detail(match_id)
        if detail is None:
            return jsonify({"success": False, "error": "比赛未找到"}), 404
        
        # 获取赔率历史数据
        odds_history = provider.get_odds_history(match_id)
        detail["had_history"] = odds_history.get("had_history", [])
        detail["hhad_history"] = odds_history.get("hhad_history", [])
        
        return jsonify({"success": True, "match": detail})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/export', methods=['POST'])
def api_export():
    try:
        data = request.get_json()
        if not data or not data.get('match_ids'):
            return jsonify({"success": False, "error": "请选择至少一场比赛"}), 400

        match_ids = data['match_ids']
        matches = match_service.get_matches_by_ids(match_ids)

        if not matches:
            return jsonify({"success": False, "error": "未找到选中的比赛数据"}), 404

        filepath, filename = generate_excel(matches)
        return jsonify({
            "success": True,
            "filename": filename,
            "download_url": f"/download/{filename}",
            "match_count": len(matches),
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(
        config.OUTPUT_DIR, filename, as_attachment=True
    )


if __name__ == '__main__':
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)
    print(f"数据提供者: {config.DATA_PROVIDER}")
    print(f"Excel输出目录: {config.OUTPUT_DIR}")
    print(f"启动服务: http://{config.HOST}:{config.PORT}")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
