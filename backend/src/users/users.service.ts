import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(@InjectRepository(User) private repo: Repository<User>) { }



    // Seed a default admin user on startup
    async onModuleInit() {
        const exists = await this.repo.findOne({ where: { username: 'gifttracker' } });
        if (!exists) {
            const hash = await bcrypt.hash('gifttracker123', 10);
            await this.repo.save(this.repo.create({ username: 'gifttracker', password: hash }));
        }
    }

    findByUsername(username: string) {
        return this.repo.findOne({ where: { username } });
    }
}
