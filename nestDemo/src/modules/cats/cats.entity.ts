import { Exclude, instanceToPlain } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  toJSON() {
    return instanceToPlain(this);
  }
}
