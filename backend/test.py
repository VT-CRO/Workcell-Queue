import requests

uuid = "2284a82b-303d-4ee8-95fe-e93ffedd50bf"

SERVER_URL = "http://localhost:3000"  # Replace with your server's URL
BOT_UUID = "2284a82b-303d-4ee8-95fe-e93ffedd50bf"

def download_gcode():
    # Construct the URL for the bot-specific route
    url = f"{SERVER_URL}/{BOT_UUID}/requestgcode"

    try:
        print(f"Sending request to: {url}")
        response = requests.get(url, stream=True)

        # Check if the request was successful
        if response.status_code == 200:
            # Extract filename from Content-Disposition header
            content_disposition = response.headers.get("Content-Disposition", "")
            filename = "downloaded_file.gcode"  # Default filename
            if "filename=" in content_disposition:
                filename = content_disposition.split("filename=")[1].strip().strip('"')

            # Write the file in chunks to avoid memory issues with large files
            with open(filename, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
            print(f"File downloaded successfully and saved as '{filename}'")
        elif response.status_code == 404:
            print("Error: The queue is empty or no file to download.")
        elif response.status_code == 500:
            print("Error: File not found on the server.")
        else:
            print(f"Error: Received unexpected status code {response.status_code}")
            print(response.json())  # Print server error details if available

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    download_gcode()