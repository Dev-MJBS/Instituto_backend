import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Maria Silva', description: 'Nome do remetente (mín. 2 caracteres)' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'maria@email.com', description: 'E-mail válido do remetente' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Gostaria de saber mais sobre os cursos oferecidos.',
    description: 'Mensagem (mín. 10 caracteres)',
  })
  @IsString()
  @MinLength(10)
  message!: string;
}
