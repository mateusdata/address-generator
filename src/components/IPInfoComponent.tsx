import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IPInfoComponent = () => {
  const [ipInfo, setIpInfo] = useState<any>(null);

  useEffect(() => {
    const fetchIpInfo = async () => {
      try {
        const response = await axios.get('https://ipinfo.io/200.239.219.170?token=38893cf343c569');
        setIpInfo(response.data);
      } catch (error) {
        console.error('Erro ao buscar informações de IP:', error);
      }
    };

    fetchIpInfo();
  }, []);

  if (!ipInfo) {
    return <div className="flex items-center justify-center min-h-screen  dark:bg-[#202124] dark:text-gray-400 bg-gray-100  text-gray-700">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100  text-gray-700 p-4  dark:bg-[#202124] dark:text-gray-400">
      <h1 className="text-3xl font-bold mb-4">Informações de IP</h1>
      <p><strong>IP:</strong> {ipInfo.ip}</p>
      <p><strong>Cidade:</strong> {ipInfo.city}</p>
      <p><strong>Região:</strong> {ipInfo.region}</p>
      <p><strong>País:</strong> {ipInfo.country}</p>
      <p><strong>Localização:</strong> {ipInfo.loc}</p>
      <p><strong>Código Postal:</strong> {ipInfo.postal}</p>
      <p><strong>Fuso Horário:</strong> {ipInfo.timezone}</p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Informações de ASN</h2>
      <p><strong>ASN:</strong> {ipInfo.asn?.asn}</p>
      <p><strong>Nome:</strong> {ipInfo.asn?.name}</p>
      <p><strong>Domínio:</strong> {ipInfo.asn?.domain}</p>
      <p><strong>Rota:</strong> {ipInfo.asn?.route}</p>
      <p><strong>Tipo:</strong> {ipInfo.asn?.type}</p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Informações da Empresa</h2>
      <p><strong>Nome:</strong> {ipInfo.company?.name}</p>
      <p><strong>Domínio:</strong> {ipInfo.company?.domain}</p>
      <p><strong>Tipo:</strong> {ipInfo.company?.type}</p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Privacidade</h2>
      <p><strong>VPN:</strong> {ipInfo.privacy?.vpn ? 'Sim' : 'Não'}</p>
      <p><strong>Proxy:</strong> {ipInfo.privacy?.proxy ? 'Sim' : 'Não'}</p>
      <p><strong>Tor:</strong> {ipInfo.privacy?.tor ? 'Sim' : 'Não'}</p>
      <p><strong>Relay:</strong> {ipInfo.privacy?.relay ? 'Sim' : 'Não'}</p>
      <p><strong>Hospedagem:</strong> {ipInfo.privacy?.hosting ? 'Sim' : 'Não'}</p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">Informações de Abuso</h2>
      <p><strong>Endereço:</strong> {ipInfo.abuse?.address}</p>
      <p><strong>País:</strong> {ipInfo.abuse?.country}</p>
      <p><strong>Email:</strong> {ipInfo.abuse?.email}</p>
      <p><strong>Nome:</strong> {ipInfo.abuse?.name}</p>
      <p><strong>Rede:</strong> {ipInfo.abuse?.network}</p>
      <p><strong>Telefone:</strong> {ipInfo.abuse?.phone}</p>
    </div>
  );
};

export default IPInfoComponent;
