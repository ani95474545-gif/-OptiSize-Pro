from flask import Flask, render_template, request, send_file, jsonify
from PIL import Image
import img2pdf
import os
import io
import base64
from datetime import datetime

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_to_pdf():
    try:
        # Get JSON data from frontend
        data = request.get_json()
        if not data or 'images' not in data:
            return jsonify({'error': 'No images provided'}), 400
        
        images_data = data['images']
        image_files = []
        
        # Process each image
        for img_data in images_data:
            # Extract base64 data
            if 'data:image' in img_data:
                header, base64_data = img_data.split(',', 1)
            else:
                base64_data = img_data
            
            # Decode base64 image
            image_bytes = base64.b64decode(base64_data)
            
            # Convert to PIL Image and save temporarily
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary (for JPEG compatibility)
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Save temporary file
            temp_filename = f"temp_{datetime.now().strftime('%Y%m%d%H%M%S%f')}.jpg"
            temp_path = os.path.join(UPLOAD_FOLDER, temp_filename)
            image.save(temp_path, 'JPEG', quality=95)
            image_files.append(temp_path)
        
        # Generate PDF
        pdf_bytes = img2pdf.convert(image_files)
        
        # Generate output filename
        output_filename = f"converted_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        output_path = os.path.join(UPLOAD_FOLDER, output_filename)
        
        # Save PDF
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)
        
        # Clean up temporary image files
        for temp_file in image_files:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        
        return jsonify({
            'success': True,
            'pdf_url': f'/download/{output_filename}',
            'filename': output_filename
        })
        
    except Exception as e:
        # Clean up on error
        if 'image_files' in locals():
            for temp_file in image_files:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>')
def download_pdf(filename):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(
                file_path,
                as_attachment=True,
                download_name=filename,
                mimetype='application/pdf'
            )
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/cleanup', methods=['POST'])
def cleanup():
    """Clean up old files"""
    try:
        current_time = datetime.now()
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                # Delete files older than 1 hour
                file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                if (current_time - file_time).total_seconds() > 3600:
                    os.remove(file_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
