import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FormControl, Paper, TextField } from '@mui/material';
import MarkerClusters from 'react-leaflet-cluster'



const Maps = () => {

    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const customIcon = L.icon({
        iconUrl: require('../Assets/marker.png'),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
    
    const paperstyle = { padding: "30px 20px", width: 800, margin: "20px auto" }

    const handleFormSubmit = (event) => {

        event.preventDefault();

        // Convert latitude and longitude to numbers
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            alert('Invalid latitude or longitude!');
            return;
        }

    };

    return (
        <div className="App">
            <Paper elevation={3} style={paperstyle} className='bg-info-subtle rounded-5 mt-5 d-flex justify-content-center flex-column w-25'>

                <h2 className='d-flex justify-content-center align-item-center'>Find Locations</h2>
                
                <form onSubmit={handleFormSubmit} className='d-flex justify-content-center flex-column'>
                    <FormControl fullWidth>
                        <TextField
                            fullWidth
                            label='Latitude'
                            onChange={(e) => setLatitude(e.target.value)}
                            className='mb-3 mt-3'
                            color='secondary'
                        />

                        <TextField
                            fullWidth
                            label='Longitude'
                            onChange={(e) => setLongitude(e.target.value)}
                            color='secondary'
                        />
                    </FormControl>

                    <button type="submit" className='btn btn-secondary mt-3'>Show Location</button>
                </form>
            </Paper>


            {latitude && longitude && (
                <div>
                    <MapContainer center={[parseFloat(latitude), parseFloat(longitude)]} zoom={18} style={{ height: '100vh', marginTop: '20px' }} scrollWheelZoom={false} className='m-4 rounded-4 border border-black'>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MarkerClusters>
                            <Marker position={[parseFloat(latitude), parseFloat(longitude)]} icon={customIcon}>
                                <Popup>
                                    <h6>Location: {latitude}, {longitude}</h6>
                                </Popup>
                            </Marker>
                        </MarkerClusters>
                    </MapContainer>
                </div>
            )}

        </div>
    );
}

export default Maps



export const MultipleMarker = () => {

    const [showAllPumps, setShowAllPumps] = useState(false);

    const customIcon = L.icon({
        iconUrl: require('../Assets/fuel-station.png'),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

    const petrolPumps = [
        { id: 1, name: 'Bharat Petroleum', latitude: 23.03877773436723, longitude: 72.51175055198293 },
        { id: 2, name: 'IndianOil', latitude: 23.036805203718668, longitude: 72.51996722348767 },
        { id: 3, name: 'HP Petrol Pump', latitude: 23.03271915551481, longitude: 72.51297539742463 },
        { id: 4, name: 'HShree Siddhivinayak Petroleum', latitude: 23.04089386073751, longitude: 72.51834811970393 },
        { id: 5, name: 'Nayara Petrol Pump', latitude: 23.036485372572226, longitude: 72.50233743571953 },
    ]

    const handleShowAllPumps = () => {
        setShowAllPumps(true);
      };

    const paperstyle = { padding: "30px 20px", width: 800, margin: "20px auto" }

    return (
        <div className="App">
            <Paper elevation={3} style={paperstyle} className='bg-info-subtle rounded-5 mt-5 d-flex justify-content-center flex-column w-25'>

                <h2 className='d-flex justify-content-center align-item-center'>Find Petrol Pumps</h2>
                <button onClick={handleShowAllPumps} className='btn btn-secondary rounded-pill mt-3'>Show Nearby Petrol Pumps</button>
                
            </Paper>

            <MapContainer center={[23.034225, 72.511578]} zoom={13} style={{ height: '100vh', marginTop: '20px' }} scrollWheelZoom={false} className='m-4 rounded-4 border border-black'>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {showAllPumps &&
                    <MarkerClusters>
                        {petrolPumps.map((pump) => (
                            <Marker key={pump.id} position={[pump.latitude, pump.longitude]} icon={customIcon}>
                                <Popup>
                                    <h6>{pump.name}</h6>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusters>
                }
            </MapContainer>


        </div>
    );
}
