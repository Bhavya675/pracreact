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
            <Paper elevation={3} style={paperstyle} className='bg-info-subtle rounded-5 mt-5'>

                <h2 className='d-flex justify-content-center align-item-center'>Find Location</h2>

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

                    {/* <button type="submit" className='btn btn-secondary mt-3'>Show Location</button> */}
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

// import { GoogleMap, LoadScript, Marker } from 'react-google-maps';

// const containerStyle = {
//     width: '100%',
//     height: '400px',
// };

// const paperstyle = { padding: "30px 20px", width: 800, margin: "20px auto" }

// const center = {
//     lat: 0,
//     lng: 0,
// };

// function Maps() {
//     const [lat, setLat] = useState('');
//     const [lng, setLng] = useState('');


//     const handleFormSubmit = (event) => {
//         event.preventDefault();
//         center.lat = parseFloat(lat);
//         center.lng = parseFloat(lng);
//     };

//     return (
//         <div>
//             <Paper elevation={3} style={paperstyle} className='bg-info-subtle rounded-5 mt-5'>

//                 <h2 className='d-flex justify-content-center align-item-center'>Find Location</h2>

//                 <form onSubmit={handleFormSubmit} className='d-flex justify-content-center flex-column'>
//                     <FormControl fullWidth>
//                         <TextField
//                             fullWidth
//                             label='Latitude'
//                             onChange={(e) => setLat(e.target.value)}
//                             className='mb-3 mt-3'
//                             color='secondary'
//                         />

//                         <TextField
//                             fullWidth
//                             label='Longitude'
//                             onChange={(e) => setLng(e.target.value)}
//                             color='secondary'
//                         />
//                     </FormControl>

//                     {/* <button type="submit" className='btn btn-secondary mt-3'>Show Location</button> */}
//                 </form>
//             </Paper>
//             <LoadScript googleMapsApiKey="API-Key">
//                 <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
//                     <Marker position={center} />
//                 </GoogleMap>
//             </LoadScript>
//         </div>
//     );
// }

// export default Maps;