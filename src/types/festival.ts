export interface Festival {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location: {
    placeName: string; // DB: place_name
    address: string;   // DB: address
    lat: number;       // DB: latitude
    lng: number;       // DB: longitude
  };
  posterUrl: 0;
}