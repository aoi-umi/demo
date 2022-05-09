import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreateUserDto {
  @Length(5)
  @ApiProperty()
  name: string;

  @IsOptional()
  @Length(5)
  @Type()
  @ApiProperty({
    required: false,
  })
  test?: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
