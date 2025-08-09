from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcript_text(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = transcript_list.find_transcript(['en']) # You can add more languages here
        return transcript.fetch()
    except Exception as e:
        return {'error': str(e)}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query_components = parse_qs(urlparse(self.path).query)
        video_id = query_components.get("videoId", [None])[0]

        if not video_id:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'No video ID provided'}).encode('utf-8'))
            return

        transcript_data = get_transcript_text(video_id)

        if 'error' in transcript_data:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': transcript_data['error']}).encode('utf-8'))
        else:
            transcript_text = " ".join([item['text'] for item in transcript_data])
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'transcript': transcript_text}).encode('utf-8'))
