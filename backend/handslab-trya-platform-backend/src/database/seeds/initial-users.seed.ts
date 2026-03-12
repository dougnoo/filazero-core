import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { UserEntity } from '../../modules/users/infrastructure/entities/user.entity';
import { DoctorEntity } from '../../modules/users/infrastructure/entities/doctor.entity';
import { UserRole } from '../../shared/domain/enums/user-role.enum';
import { Gender } from '../../shared/domain/enums/gender.enum';

async function seedInitialUsers() {
  const logger = new Logger('InitialUsersSeed');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const userRepository = dataSource.getRepository(UserEntity);
    const doctorRepository = dataSource.getRepository(DoctorEntity);

    logger.log('🌱 Starting initial users seed...');
    logger.log('');

    // 1. Create SUPER_ADMIN
    const superAdminEmail = 'superadmin@tryaplatform.com';
    let superAdmin = await userRepository.findOne({
      where: { email: superAdminEmail },
    });

    if (superAdmin) {
      logger.warn(`✓ Super Admin already exists: ${superAdminEmail}`);
    } else {
      superAdmin = userRepository.create({
        cognitoId: `PLACEHOLDER_SUPERADMIN_${Date.now()}`,
        email: superAdminEmail,
        name: 'Super Admin',
        phone: '+5511999999999',
        cpf: '12345678901',
        birthDate: new Date('1980-01-15'),
        gender: Gender.MALE,
        role: UserRole.SUPER_ADMIN,
      });
      await userRepository.save(superAdmin);
      logger.log(`✅ Super Admin created: ${superAdminEmail}`);
    }

    // 2. Create ADMIN
    const adminEmail = 'admin@tryaplatform.com';
    let admin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (admin) {
      logger.warn(`✓ Admin already exists: ${adminEmail}`);
    } else {
      admin = userRepository.create({
        cognitoId: `PLACEHOLDER_ADMIN_${Date.now()}`,
        email: adminEmail,
        name: 'Admin User',
        phone: '+5511988888888',
        cpf: '98765432109',
        birthDate: new Date('1985-03-22'),
        gender: Gender.MALE,
        role: UserRole.ADMIN,
      });
      await userRepository.save(admin);
      logger.log(`✅ Admin created: ${adminEmail}`);
    }

    // 3. Create DOCTOR
    const doctorEmail = 'doctor@tryaplatform.com';
    let doctor = await userRepository.findOne({
      where: { email: doctorEmail },
    });

    if (doctor) {
      logger.warn(`✓ Doctor already exists: ${doctorEmail}`);
    } else {
      doctor = userRepository.create({
        cognitoId: `PLACEHOLDER_DOCTOR_${Date.now()}`,
        email: doctorEmail,
        name: 'Maria Silva',
        phone: '+5511977777777',
        cpf: '11122233344',
        birthDate: new Date('1990-07-10'),
        gender: Gender.FEMALE,
        role: UserRole.DOCTOR,
      });
      const savedDoctor = await userRepository.save(doctor);

      // Create doctor profile
      const doctorProfile = doctorRepository.create({
        userId: savedDoctor.id,
        boardCode: 'CRM' as any,
        boardNumber: '123456',
        boardState: 'SP',
        specialty: 'Cardiologia',
      });
      await doctorRepository.save(doctorProfile);

      logger.log(`✅ Doctor created: ${doctorEmail}`);
    }

    logger.log('');
    logger.log('📋 Summary:');
    logger.log(`   Super Admin: ${superAdminEmail}`);
    logger.log(`   Admin: ${adminEmail}`);
    logger.log(`   Doctor: ${doctorEmail}`);
    logger.log('');
    logger.log('⚠️  Next steps:');
    logger.log('   1. Create users in AWS Cognito with these emails');
    logger.log('   2. Add users to appropriate Cognito groups:');
    logger.log('      - SUPER_ADMIN group for superadmin@tryaplatform.com');
    logger.log('      - ADMIN group for admin@tryaplatform.com');
    logger.log('      - DOCTOR group for doctor@tryaplatform.com');
    logger.log(
      '   3. Update cognito_id in database with Cognito Sub for each user',
    );

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to seed initial users', error);
    process.exit(1);
  }
}

seedInitialUsers();
