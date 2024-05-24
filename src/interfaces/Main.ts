export default interface Host {
    ip: string;
    hostname: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
}

export  interface AccessRecord {
    ip: string;
    dataAcesso: string;
    host: Host;
}