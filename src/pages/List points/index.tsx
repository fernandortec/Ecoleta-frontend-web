import React, { useState, useEffect } from 'react';

import api from '../../services/api';

const ListPoints:React.FC = () => {

    const[points,setPoints] = useState<String[]>([]);

    useEffect(() => {
        api.get('/points').then(allPoints => {
            setPoints(allPoints.data);
            console.log(points)
        });
    }, [])



    return(
        <h1>Listagem de pontos de coleta</h1>

    )
};

export default ListPoints;