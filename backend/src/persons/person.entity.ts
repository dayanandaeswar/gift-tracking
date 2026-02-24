import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { GiftReceived } from '../gifts-received/gift-received.entity';
import { GiftGiven } from '../gifts-given/gift-given.entity';

@Entity('persons')
export class Person {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @OneToMany(() => GiftReceived, (gr) => gr.person)
    giftsReceived: GiftReceived[];

    @OneToMany(() => GiftGiven, (gg) => gg.person)
    giftsGiven: GiftGiven[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
