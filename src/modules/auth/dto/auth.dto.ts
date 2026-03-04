import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@institutojob.com.br' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin@IJB2026!' })
  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refresh_token!: string;
}
