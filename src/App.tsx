import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cepEstados from './utils/CepEstados';
import dados from './utils/Dados';

interface Local {
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

const App: React.FC = () => {
  const [local, setLocal] = useState<Local | any>({
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });
  const [ip, setIp] = useState('');
  const [url, setUrl] = useState("");

  useEffect(() => {
    axios.get('https://api.ipify.org?format=json')
      .then(response => {
        setIp(response.data.ip);
      })
      .catch(error => {
        console.error('Erro ao buscar o IP:', error);
      });
  }, []);


  const consultCep = async (cep: any) => {
    try {
      const index = Math.floor(Math.random() * cepEstados[cep]?.length);
      const newArray = cepEstados[cep]

      setUrl(`https://viacep.com.br/ws/${newArray[index]}/json/`)
      const response = await axios.get(`https://viacep.com.br/ws/${newArray[index]}/json/`);
      setLocal({
        ...local,
        endereco: response.data.logradouro,
        cidade: response.data.localidade,
        estado: response.data.uf,
        cep: response.data.cep,
        ddd: response.data.ddd,

      });

    } catch (error) {
      console.error('Erro ao buscar o CEP:', error);
      setLocal([])
    }
  };



  return (
    <div className='p-5 bg-gray-50 h-screen'>
      <h1 className='font-medium text-lg'>Gerador de Estados e DDDs</h1>


      <form className='flex gap-2 flex-col bg-gray-50 mt-5'>
        <div className='flex gap-3'>
          <input className='rounded-md p-1 border outline-blue-600 px-2 cursor-pointer' disabled type="text" placeholder="Endereço" value={local.endereco} />
          <input className='rounded-md p-1 border outline-blue-600 px-2 cursor-pointer' disabled type="text" placeholder="Cidade" value={local.cidade} />
        </div>

        <div className='flex gap-3'>
          <input className='rounded-md p-1 border outline-blue-600 px-2 cursor-pointer' disabled type="text" placeholder="Estado" value={local.estado} />
          <input className='rounded-md p-1 border outline-blue-600 px-2 cursor-pointer' disabled type="text" placeholder="CEP" value={local.cep} />
        </div>

        <div className='flex gap-3'>
          <input className='rounded-md p-1 border outline-blue-600 px-2 cursor-pointer' disabled type="text" placeholder="DDD" value={local.ddd} />
        </div>
      </form>
      {false && <a href={url}>{url}</a>
      }      <div className='mt-8'>
        <h3>Lista de Estados e DDDs:</h3>
        <button className='flex flex-wrap gap-2 border p-2 rounded-lg py-5 mt-5'>
          {dados.map((item, index) => (
            <div onClick={() => consultCep(item.uf)} className='bg-blue-800 hover:bg-blue-500 hover:text-ellipsis active:outline-blue-500 active:outline text-gray-200 mb-2 p-1 px-2 rounded-lg' key={index}>
              <p>{item.estado} : {item.ddds}</p>
            </div>
          ))}
        </button>
      </div>

      <div>
        <h3 className='flex gap-2'>Seu IP é: <p className='text-green-500 animate-pulse'>{ip}</p></h3>
      </div>
    </div>
  );
}

export default App;

