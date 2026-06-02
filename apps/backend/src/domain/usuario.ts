export abstract class Usuario {
  protected readonly id: number;
  protected readonly nome: string;
  protected readonly email: string;
  protected readonly phone: string;

  constructor(id: number, nome: string, email: string, phone: string) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.phone = phone;
  }
}
