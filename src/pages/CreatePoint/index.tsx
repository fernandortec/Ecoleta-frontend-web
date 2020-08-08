import React, {useEffect, useState,ChangeEvent, FormEvent} from 'react';
import { Link,useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import './styles.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';

//Importing axios with baseURL

import axios from 'axios';

//Importing axios without baseURL

interface Item {
    id: number,
    title:string,
    image_url:string,
}

interface IBGEUF {
    sigla: string
}

interface IBGECity {
    nome:string,
}

const CreatePoint: React.FC = () => {

    // All string array consts

    const[items,setItems] = useState<Item[]>([]);
    const[ufs,setUfs] = useState<string[]>([]);
    const[cities,setCities] = useState<string[]>([]);

    const[formData,setFormData] = useState({
        name:'',
        email:'',
        whatsapp:'',
    });

    const[selectedUF,setSelectedUF] = useState('0');
    const[selectedCity,setSelectedCity] = useState('0');;
    const[selectedItems,setSelectedItems] = useState<number[]>([]);
    const[selectedPosition,setSelectedPosition] = useState<[number,number]>([0,0]) //Initializing a state with a mandatory 2 item array
    const[initialPosition,setInitialPosition] = useState<[number,number]>([0,0])

    const history = useHistory();

    useEffect(() => {
        api.get('/items').then(items => {
            setItems(items.data);
        })
    },[]);

    useEffect(() => {
        axios.get<IBGEUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(states => {
        const ufInitials = states.data.map(uf => uf.sigla);

        //IBGE api to get all the country states
        
        setUfs(ufInitials);
        });
    },[]);

    useEffect(() => {
        if(selectedUF === '0'){
            return ;
        } else {
            axios.get<IBGECity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(cities =>{
                const cityNames = cities.data.map(city => city.nome);

            //IBGE api to get all the country cities

                setCities(cityNames);
            }); 
        }


    }, [selectedUF] /* Triggering the function when the user select a state */ );

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;

            //Getting the user location and then using it as a starting point

            setInitialPosition([
                latitude,
                longitude
            ]);

            //Changing the selected position (handleMapClick), so when the screen loads, it will have a marker on its current location

            setSelectedPosition([
                latitude,
                longitude
            ]);
        })
    },[]);

    function handleSelectedUF(e: ChangeEvent<HTMLSelectElement>){

        //State selected

        setSelectedUF(e.target.value);
    };

    function handleSelectedCity(e: ChangeEvent<HTMLSelectElement>){

        //City selected

        setSelectedCity(e.target.value);
    };
    
    function handleMapClick(e: LeafletMouseEvent){
        setSelectedPosition([
            e.latlng.lat,
            e.latlng.lng
        ])
    };

    function handleInputChange(e: ChangeEvent<HTMLInputElement>){
        const { name , value} = e.target;

        setFormData({
            ...formData,
            [name]:value

            //Copying the existing data and then replacing
        });
    };

    function handleSelectedItem(id:number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);

            console.log(id)
            setSelectedItems(filteredItems);

            //Checking and changing if the item is already selected

        } else {
            setSelectedItems([...selectedItems, id])

            //Copying the existing data and then replacing it
        }
    };

    async function handleSubmit(e: FormEvent){
        e.preventDefault();

        const { name, email, whatsapp} = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const[latitude,longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };
        
        await api.post('points',data);

        alert('Ponto de coleta cadastrado');

        history.push('/list-points');
        
    };

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to='/' >
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit} >
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            onChange={handleInputChange}
                            autoComplete='off'
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                onChange={handleInputChange}
                                autoComplete='off'
                            />
                        </div>
                        </div>
                        <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            required
                            autoComplete='off'
                            onChange={handleInputChange}
                        />
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick} >
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"                            
                        />
                        <Marker 
                            position={selectedPosition}
                            
                        />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                onChange={handleSelectedUF} 
                                name="uf" 
                                id="uf"
                                value={selectedUF}
                                required
                                >
                                <option value="0">Selecione uma UF</option>
                                
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}

                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                onChange={handleSelectedCity}
                                name="city"
                                id="city"
                                value={selectedCity}
                                required
                            >
                                <option value="0">Selecione uma cidade</option>

                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}

                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>ítems de coleta</h2>
                        <span>Selecione um ou mais items abaixo</span>
                    </legend>
                        <ul className="items-grid">
                            {
                            items.map(item => (
                                <li
                                    key={item.id}
                                    onClick={() => handleSelectedItem(item.id) /* Using parâmeter in react*/ }
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                    >
                                    <img src={item.image_url} alt="Imagem"/>
                                    <span>{item.title}</span>
                                </li>  
                            ))}
                        </ul>
                </fieldset>

                <button type='submit'>Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint;