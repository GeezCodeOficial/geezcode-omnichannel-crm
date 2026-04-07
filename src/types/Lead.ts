export interface Lead {
  /** 
   * Name of the company extracted 
   * Nome extraído da empresa 
   */
  nomeEmpresa: string;
  
  /** 
   * Location or city of the company 
   * Localização ou cidade 
   */
  cidade: string;
  
  /** 
   * WhatsApp/Contact number 
   * Contato extraído 
   */
  contato: string;
  
  /** 
   * Detected failure: e.g. "Sem Site", "Linktree" 
   * Falha digital detectada usada para ancoragem de venda 
   */
  falhaDigitalDetectada: string;
  
  /** 
   * Original reference link (Google Maps or IG) 
   * Link de referência 
   */
  linkReferencia: string;
  
  /** 
   * Google Maps Rating 
   * Avaliação da empresa 
   */
  rating: number;
}
