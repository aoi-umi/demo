import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { Cat } from './cats.entity';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly resp: Repository<Cat>,
  ) {}

  create(createUserDto: CreateCatDto): Promise<Cat> {
    const cat = new Cat();
    cat.firstName = createUserDto.firstName;
    cat.lastName = createUserDto.lastName;

    return this.resp.save(cat);
  }

  async findAll(options?: FindManyOptions<Cat>): Promise<Cat[]> {
    return this.resp.find(options);
  }

  findOne(id: string): Promise<Cat> {
    return this.resp.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.resp.delete(id);
  }
}
