import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private apiBaseUrl = environment.apiUrl;

  /**
   * Build a safe image URL for use in templates.
   * Accepts string | null | undefined and always returns a string (fallback if needed).
   */
  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
        console.log("NO IMAGE PATH")
      return 'assets/images/fallback.png';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (imagePath.startsWith('file://')) {
      const filename = imagePath.split('/').pop();
      return filename ? `${this.apiBaseUrl}/uploads/${filename}` : 'assets/images/fallback.jpg';
    }

    if (imagePath.startsWith('/uploads')) {
      return `${this.apiBaseUrl}${imagePath}`;
    }

    if (imagePath && !imagePath.includes('/')) {
      return `${this.apiBaseUrl}/uploads/${imagePath}`;
    }
    console.log("FALLBACK")
    return 'assets/images/fallback.jpg';
  }
}
