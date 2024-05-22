import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import cepEstados from './utils/CepEstados';
import dados from './utils/Dados';
import { FloatButton, Spin, notification } from 'antd';
import { LoadingOutlined, GithubOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ReloadOutlined,DeleteOutlined  } from '@ant-design/icons';
import 'animate.css';

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
  const [isDisabled, setIsDisabled] = useState(false);
  const [myIps, setMyIps] = useState<any>([]);
  const [darkMode, setDarkMode] = useState(localStorage.theme === 'dark');
  const [refress, setRefress] = useState(true)


  const hasFetchedIp = useRef(false);

  const [alertShown, setAlertShown] = useState(true);

  useEffect(() => {
    const savedIpsString = localStorage.getItem('myIps');
    if (savedIpsString) {
      const savedIpsArray = JSON.parse(savedIpsString);
      setMyIps(savedIpsArray);
    }

    const fetchIp = async () => {
      try {
        if (!hasFetchedIp.current) {
          hasFetchedIp.current = true;
          const response = await axios.get('https://api.ipify.org?format=json');
          const newIp = response.data.ip;
          setIp(newIp);

          setMyIps((prevIps: any) => {
            const currentDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
            const updatedIps = [...prevIps, { ip: newIp, dataAcesso: currentDateTime }];

            // Check if the new IP is repeated
            const isRepeated = myIps ? prevIps?.some((ipItem: any) => ipItem?.ip === newIp): false;
            if (isRepeated && updatedIps?.length > prevIps?.length) {
              const notify = (type: NotificationType) => {
                api[type]({
                  message: `Seu IP ${newIp} está repetido`,
                  description: '',
                });
              };
              notify("error");
              setAlertShown(false);
            }


            localStorage.setItem('myIps', JSON.stringify(updatedIps));
            return updatedIps;
          });
        }
      } catch (error) {
        console.error('Erro ao buscar o IP:', error);
      }
    };

    fetchIp();
  }, [alertShown, api, refress]);


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [darkMode]);





  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: 'Copiando com sucesso!',
      description: '',
    });
  };


  const consultCep = async (cep: any, retryCount: number = 0): Promise<void> => {
    try {
      if (retryCount >= 3) {
        console.log("Número máximo de tentativas alcançado.");
        setError("Ops!. Ocorreu um erro, tenha paciencia.")
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
          endereco: response?.data?.logradouro ? response?.data?.logradouro : "Rua trinta e um de março",
          cidade: response?.data?.localidade,
          estado: response?.data?.uf,
          cep: response?.data?.cep,
          ddd: response?.data?.ddd,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar o CEP:', error);
      setLoading(false)
    }
  };

  const copy = async (message: string, index: number) => {
    try {
      setIsDisabled(true)
      await navigator.clipboard.writeText(message);
      setIsDisabled(false)
    } catch (error) {
      console.log("erro ao copiar")
    }
    local?.cep && openNotificationWithIcon("success");
  };

  const deleteIps = () => {
    localStorage.removeItem("myIps")
    setMyIps("")
  }
  const repeatedIps = new Set();
  myIps && myIps?.forEach((item: any) => {
    if (myIps?.filter((ipItem: any) => ipItem?.ip === item?.ip)?.length > 1) {
      repeatedIps?.add(item?.ip);
    }
  });
  return (
    <div className='p-5 dark:bg-[#202124] dark:text-gray-400 bg-gray-100 min-h-screen xl:flex xl:flex-row xl:gap-8'>

      <div>
      {contextHolder}
      <div className='flex gap-2 items-center-center flex-col sm:flex-row items-center'>
        <div className='flex gap-5'>
          <h1 className='font-medium text-lg text-center'>Gerador de Endereço por DDDs</h1>
          <a href="https://github.com/mateusdata"><GithubOutlined className='' style={{ fontSize: 25, }} /></a>
        </div>

        <button className="bg-gray-700 hover:bg-gray-800 text-white dark:text-gray-400 font-bold py-1 px-2 rounded" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>


      <div className='flex flex-col sm:flex-row gap-14 items-center sm:items-start'>

        <form className='flex gap-2 flex-col bg-gray-100  dark:bg-[#202124] mt-5'>
          <div className='flex flex-col md:flex-row gap-3'>
            <div className='flex flex-col'>
              <label htmlFor="">Rua:</label>
              <input disabled={isDisabled} onClick={() => copy(local?.endereco, 1)} className='rounded-md disabled:bg-white p-1 dark:font-semibold dark:bg-gray-800 dark:border-none border outline-none px-2 cursor-pointer' type="text" placeholder="Endereço" value={local.endereco} />

            </div>
            <div className='flex flex-col'>
              <label htmlFor="">Cidade:</label>
              <input disabled={isDisabled} onClick={() => copy(local?.cidade, 1)} className='rounded-md p-1 disabled:bg-white  dark:font-semibold dark:bg-gray-800 dark:border-none border outline-none px-2 cursor-pointer' type="text" placeholder="Cidade" value={local.cidade} />
            </div>
          </div>
          <div className='flex flex-col md:flex-row gap-3'>

            <div className='flex flex-col'>
              <label htmlFor="">Cep:</label>
              <input disabled={isDisabled} onClick={() => copy(local?.cep, 1)} className='rounded-md p-1 disabled:bg-white  dark:font-semibold dark:bg-gray-800 dark:border-none border outline-none px-2 cursor-pointer' type="text" placeholder="CEP" value={local.cep} />
            </div>
            <div className='flex flex-col'>
              <label htmlFor="">Estado:</label>
              <input disabled={isDisabled} onClick={() => copy(local?.estado, 1)} className='rounded-md p-1 disabled:bg-white  dark:font-semibold dark:bg-gray-800 dark:border-none border outline-none px-2 cursor-pointer' type="text" placeholder="Estado" value={local.estado} />

            </div>
          </div>
          <div className='flex flex-col md:flex-row gap-3'>

            <div className='flex flex-col'>
              <label htmlFor="">DDD:</label>
              <input disabled={isDisabled} onClick={() => copy(local?.ddd, 1)} className='rounded-md p-1 disabled:bg-white  dark:font-semibold dark:bg-gray-800 dark:border-none border outline-none px-2 cursor-pointer' type="text" placeholder="DDD" value={local.ddd} />
            </div>
          </div>
        </form>


      </div>
      {false && <a href={url}>{url}</a>}

      <div className='mt-2 animate__animated animate__slideInLeft'>

        <div className='text-red-600  min-h-8 min-w-6'>
          <span>
            {error}
          </span>
        </div>
        <span className='flex gap-3'>
          <h3>Lista de Estados e DDDs:</h3>
          {loading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
        </span>

        <button className='flex flex-wrap gap-2 border dark:border-gray-800 py-1 rounded-lg  wfull mt-2 p-2 2xl:w-1/1'>
          {dados.map((item, index) => (
            <button onClick={() => consultCep(item.uf)} disabled={loading}
              className={`hover:text-ellipsis active:outline-blue-500  dark:active:outline-gray-900
            active:outline text-gray-200 dark:text-gray-400 mb-2 p-1 px-2
            ${index === 0 && "bg-blue-600 hover:bg-blue-700"} 
            ${index > 0 && index < 3 && "bg-orange-600 hover:bg-orange-700"} 
            ${index === 3 && "bg-green-600 hover:bg-green-700"} 
            ${index > 3 && index < 6 && "bg-yellow-600 hover:bg-yellow-700"} 
            ${index === 6 && "bg-purple-600 hover:bg-purple-700"} 
            ${index > 6 && index < 14 && "bg-indigo-600 hover:bg-indigo-700"} 
            ${index > 13 && index < 16 && "bg-red-600 hover:bg-red-700"}
            ${index === 16 && "bg-cyan-600 hover:bg-cyan-700"} 

            ${index > 16 && index < 22 && "bg-gray-800 hover:bg-gray-800"}
            ${index > 21 && "bg-[#4527a0] hover:bg-[#4527a0]"}
                     
            rounded-lg ${loading ? "bg-gray-500 text-gray-50 dark:text-gray-400 hover:bg-gray-500 dark:active:outline-gray-900 active:outline-gray-300 " : "bg-blue-700 dark:bg-gray-800 hover:bg-blue-900 "}`} key={index}>
              <p>{item.estado} : {item.ddds}</p>
            </button>
          ))}
        </button>

      </div>

      </div>



      <div className='2xl:w-full xl:w-[1700px]  overflow-auto lg:max-h-[85vh] xl:border-gray-300 dark:xl:border-gray-600 animate__animated animate__slideInUp rounded-2xl shadow-md xl:border p-5'>
        <div>
          <h3 className='flex gap-2  lg:text-2xl'>IP atual: <p className='text-orange-500 lg:text-2xl'>{ip}</p></h3>
        </div>
        <div className='flex flex-col  mt-5'>
          {myIps && <button onClick={deleteIps} type="button" className="py-1 mb-1 dark:bg-[#4e4f52] px-3 lg:w-32 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-red-500  hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none text-white dark:hover:bg-red-300 dark:text-red-50 dark:hover:text-red-50">
            Limpar IPS <DeleteOutlined />
          </button>}
          <span>Ips usados recentemente:</span>

          <div className="overflow-x-auto mt-2">
            <table className="table-auto 2xl:w-[95%]  mb-2">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="border border-gray-400 dark:border-gray-600 px-2 py-1">IP</th>
                  <th className="border border-gray-400 dark:border-gray-600 px-2 py-1">Data de Acesso</th>
                  <th className="border border-gray-400 dark:border-gray-600 px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {myIps && myIps?.slice()?.reverse()?.map((item: any, index: any) => (
                  <tr key={index} className={`$ bg-gray-100 dark:bg-gray-700 dark:text-gray-100 text-gray-700`}>
                    <td className="border border-gray-400 dark:border-gray-600 px-2 py-1">{item.ip}</td>
                    <td className="border border-gray-400 dark:border-gray-600 px-2 py-1">{dayjs(item.dataAcesso).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td className={`border border-gray-400 dark:border-gray-600 px-2 py-1  text-white ${repeatedIps.has(item.ip) ? "bg-red-500 dark:bg-red-900" : "bg-green-600"}`}>{repeatedIps.has(item.ip) ? 'Repetido' : 'Único'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <span className=''>{`Total de IPs acessados ${myIps?.length}`}</span>
          </div>



        </div>
      </div>

      <FloatButton onClick={() => { hasFetchedIp.current = false; setRefress(!refress) }} icon={<ReloadOutlined />}
            shape="circle" className='bg-blue-600 text-blue-100' tooltip={<div>Atualizar IP</div>} />

    </div>
  )
}

export default App;
