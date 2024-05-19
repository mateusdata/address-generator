import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cepEstados from './utils/CepEstados';
import dados from './utils/Dados';
import { Spin, notification } from 'antd';
import { LoadingOutlined, GithubOutlined } from '@ant-design/icons';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const App: React.FC = () => {
  const [local, setLocal] = useState({
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    ddd: ""
  });
  const [ip, setIp] = useState('');
  const [url, setUrl] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [myIps, setMyIps] = useState<any>([]);

  useEffect(() => {
    const savedIpsString = localStorage.getItem('myIps');
    if (savedIpsString) {
      const savedIpsArray = JSON.parse(savedIpsString);
      setMyIps(savedIpsArray);
    }

    const fetchIp = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        const newIp = response.data.ip;
        setIp(newIp);

        setMyIps((prevIps: any) => {
          if (!prevIps.includes(newIp)) {
            const updatedIps = [...prevIps, newIp];
            localStorage.setItem('myIps', JSON.stringify(updatedIps));
            return updatedIps;
          }
          return prevIps;
        });
      } catch (error) {
        console.error('Erro ao buscar o IP:', error);
        alert('Erro ao buscar o IP. Por favor, tente novamente mais tarde.');
      }
    };

    fetchIp();
  }, []);






  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: 'Copiando com sucesso!',
      description: '',
    });
  };

  const consultCep = async (cep: any, retryCount: number = 0): Promise<void> => {
    try {
      if (retryCount >= 10) {
        console.log("Número máximo de tentativas alcançado.");
        setError("Ops!, ainda não cadastrei esses dados, tenha paciencia.")
        setLoading(false)
        setTimeout(() => {
          setError("")
        }, 5000);
        return;
      }
      setError("")
      const index = Math.floor(Math.random() * cepEstados[cep]?.length);
      const newArray = cepEstados[cep];

      const response = await axios.get(`https://viacep.com.br/ws/${newArray[index]}/json/`);
      setUrl(`https://viacep.com.br/ws/${newArray[index]}/json/`);

      if (response?.data?.erro) {
        console.log(response.data.erro);
        setLoading(true)
        setTimeout(async () => {
          await consultCep(cep, retryCount + 1);
        }, 100);
      } else {
        setLoading(false)
        setLocal({
          ...local,
          endereco: response?.data?.logradouro,
          cidade: response?.data?.localidade,
          estado: response?.data?.uf,
          cep: response?.data?.cep,
          ddd: response?.data?.ddd,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar o CEP:', error);
      alert("Erro ao buscar o CEP. Por favor, tente novamente mais tarde.");
      setLoading(false)
    }
  };

  const copy = async (message: string, index: number) => {
    try {
      await navigator.clipboard.writeText(message);
    } catch (error) {
      console.log("erro ao copiar")
    }
    local?.cep && openNotificationWithIcon("success");
  };

  const deleteIps = () => {
    localStorage.removeItem("myIps")
    setMyIps("")
  }

  return (
    <div className='p-5 bg-gray-50 h-screen'>
      {contextHolder}
      <div className='flex gap-2 items-center-center'>
        <h1 className='font-medium text-lg'>Gerador de Estados e DDDs</h1>
        <a href="https://github.com/mateusdata"><GithubOutlined className='animate-pulse' style={{ fontSize: 25, }} /></a>
      </div>

      <span className='text-red-600'>{error}</span>
      <span className='text-red-600'>
        {loading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
      </span>

      <form className='flex gap-2 flex-col bg-gray-50 mt-5'>
        <div className='flex flex-col md:flex-row gap-3'>
          <input onClick={() => copy(local?.endereco, 1)} className='rounded-md p-1 border outline-none px-2 cursor-pointer' type="text" placeholder="Endereço" value={local.endereco} />
          <input onClick={() => copy(local?.cidade, 1)} className='rounded-md p-1 border outline-none px-2 cursor-pointer' type="text" placeholder="Cidade" value={local.cidade} />
        </div>
        <div className='flex flex-col md:flex-row gap-3'>
          <input onClick={() => copy(local?.estado, 1)} className='rounded-md p-1 border outline-none px-2 cursor-pointer' type="text" placeholder="Estado" value={local.estado} />
          <input onClick={() => copy(local?.cep, 1)} className='rounded-md p-1 border outline-none px-2 cursor-pointer' type="text" placeholder="CEP" value={local.cep} />
        </div>
        <div className='flex flex-col md:flex-row gap-3'>
          <input onClick={() => copy(local?.ddd, 1)} className='rounded-md p-1 border outline-none px-2 cursor-pointer' type="text" placeholder="DDD" value={local.ddd} />
        </div>
      </form>

      {false && <a href={url}>{url}</a>}

      <div className='mt-8'>
        
        <h3>Lista de Estados e DDDs:</h3>
        <button className='flex flex-wrap gap-2 border p-2 rounded-lg py-5 mt-5'>
          {dados.map((item, index) => (
            <button onClick={() => consultCep(item.uf)} disabled={loading}
              className={`bg-blue-800 hover:bg-blue-500 
            hover:text-ellipsis active:outline-blue-500 
            active:outline text-gray-200 mb-2 p-1 px-2 
            rounded-lg ${loading && "bg-gray-300 text-gray-700 hover:bg-gray-300 active:outline-gray-300 "}`} key={index}>
              <p>{item.estado} : {item.ddds}</p>
            </button>
          ))}
        </button>
      </div>
      <div>
        <h3 className='flex gap-2'>Seu IP é 🧐 : <p className='text-green-500 animate-pulse'>{ip}</p></h3>
      </div>
      <div className='flex flex-col  mt-5'>
        <span>Ips usados recentemente:</span>
        {myIps && <button onClick={deleteIps} type="button" className="py-2 px-3 w-52 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-red-200  hover:bg-red-400 disabled:opacity-50 disabled:pointer-events-none text-white dark:hover:bg-red-600 dark:text-red-500 dark:hover:text-red-50">
          Limpar IPS
        </button>}
        <div className='flex flex-col gap-2 mt-2'>
          {myIps && myIps?.map((item: any, index: number) => (
            <span className='rounded-xl text-red-500' key={index}>{item}</span>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;
