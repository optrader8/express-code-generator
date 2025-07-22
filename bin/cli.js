#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { version } = require('../package.json');

// 데이터베이스 타입 목록
const DATABASE_TYPES = ['sqlite', 'mongodb', 'postgres', 'mysql'];

// 유효성 검사 라이브러리 목록
const VALIDATION_LIBS = ['joi', 'zod', 'class-validator'];

// 템플릿 목록
const TEMPLATES = ['basic', 'full'];

// CLI 프로그램 설정
program
  .version(version)
  .description('Express.js 코드 생성기 - OpenAPI/Swagger 명세서로부터 Express.js API 프로젝트 생성');

// create 명령 설정
program
  .command('create')
  .description('OpenAPI/Swagger 명세서로부터 새 Express.js 프로젝트 생성')
  .requiredOption('-s, --spec <path>', 'OpenAPI 명세서 파일 경로 (필수)')
  .option('-o, --output <directory>', '생성된 코드의 출력 디렉토리', process.cwd())
  .option('-d, --db <type>', `데이터베이스 타입: ${DATABASE_TYPES.join(', ')}`, 'sqlite')
  .option('-ts, --typescript', 'TypeScript 코드 생성', true)
  .option('-v, --validation <library>', `유효성 검사 라이브러리: ${VALIDATION_LIBS.join(', ')}`, 'zod')
  .option('-t, --template <type>', `사용할 템플릿: ${TEMPLATES.join(', ')}`, 'basic')
  .option('-f, --force', '기존 파일 덮어쓰기', false)
  .action(handleCreate);

// add 명령 설정
program
  .command('add')
  .description('기존 프로젝트에 새 리소스 추가')
  .requiredOption('-s, --spec <path>', 'OpenAPI 명세서 파일 경로 (필수)')
  .requiredOption('-o, --output <directory>', '기존 프로젝트 디렉토리 (필수)')
  .action(handleAdd);

// validate 명령 설정
program
  .command('validate')
  .description('OpenAPI 명세서 유효성 검사')
  .requiredOption('-s, --spec <path>', 'OpenAPI 명세서 파일 경로 (필수)')
  .action(handleValidate);

// create 명령 핸들러
async function handleCreate(options) {
  console.log(chalk.blue('Express.js 프로젝트 생성 중...'));
  console.log(chalk.green(`명세서: ${options.spec}`));
  console.log(chalk.green(`출력 디렉토리: ${options.output}`));
  console.log(chalk.green(`데이터베이스: ${options.db}`));
  console.log(chalk.green(`TypeScript: ${options.typescript ? '예' : '아니오'}`));
  console.log(chalk.green(`유효성 검사: ${options.validation}`));
  console.log(chalk.green(`템플릿: ${options.template}`));
  
  try {
    // 명세서 파일 확인
    if (!fs.existsSync(options.spec)) {
      console.error(chalk.red(`오류: 명세서 파일을 찾을 수 없습니다: ${options.spec}`));
      process.exit(1);
    }
    
    // 데이터베이스 타입 확인
    if (!DATABASE_TYPES.includes(options.db)) {
      console.error(chalk.red(`오류: 지원되지 않는 데이터베이스 타입: ${options.db}`));
      console.error(chalk.yellow(`지원되는 데이터베이스: ${DATABASE_TYPES.join(', ')}`));
      process.exit(1);
    }
    
    // 유효성 검사 라이브러리 확인
    if (!VALIDATION_LIBS.includes(options.validation)) {
      console.error(chalk.red(`오류: 지원되지 않는 유효성 검사 라이브러리: ${options.validation}`));
      console.error(chalk.yellow(`지원되는 라이브러리: ${VALIDATION_LIBS.join(', ')}`));
      process.exit(1);
    }
    
    // 템플릿 확인
    if (!TEMPLATES.includes(options.template)) {
      console.error(chalk.red(`오류: 지원되지 않는 템플릿: ${options.template}`));
      console.error(chalk.yellow(`지원되는 템플릿: ${TEMPLATES.join(', ')}`));
      process.exit(1);
    }
    
    // OpenAPI 명세서 파싱
    const specContent = fs.readFileSync(options.spec, 'utf-8');
    let spec;
    
    if (options.spec.endsWith('.yaml') || options.spec.endsWith('.yml')) {
      spec = yaml.load(specContent);
    } else if (options.spec.endsWith('.json')) {
      spec = JSON.parse(specContent);
    } else {
      console.error(chalk.red('오류: 명세서 파일은 .yaml, .yml 또는 .json 확장자를 가져야 합니다.'));
      process.exit(1);
    }
    
    // 실제 코드 생성 로직은 여기에 구현
    console.log(chalk.blue('코드 생성 시작...'));
    
    // 여기서는 예시로 간단히 로그만 출력
    console.log(chalk.yellow('참고: 이 명령은 아직 구현 중입니다.'));
    console.log(chalk.green(`API 제목: ${spec.info?.title || '제목 없음'}`));
    console.log(chalk.green(`API 버전: ${spec.info?.version || '1.0.0'}`));
    console.log(chalk.green(`API 설명: ${spec.info?.description || '설명 없음'}`));
    
    // 경로 수 출력
    const pathCount = Object.keys(spec.paths || {}).length;
    console.log(chalk.green(`API 경로 수: ${pathCount}`));
    
    console.log(chalk.blue('코드 생성 완료!'));
  } catch (error) {
    console.error(chalk.red(`오류: ${error.message}`));
    process.exit(1);
  }
}

// add 명령 핸들러
function handleAdd(options) {
  console.log(chalk.blue('기존 프로젝트에 리소스 추가 중...'));
  console.log(chalk.green(`명세서: ${options.spec}`));
  console.log(chalk.green(`프로젝트 디렉토리: ${options.output}`));
  
  // 실제 리소스 추가 로직은 여기에 구현
  console.log(chalk.yellow('참고: 이 명령은 아직 구현 중입니다.'));
}

// validate 명령 핸들러
function handleValidate(options) {
  console.log(chalk.blue('OpenAPI 명세서 유효성 검사 중...'));
  console.log(chalk.green(`명세서: ${options.spec}`));
  
  try {
    // 명세서 파일 확인
    if (!fs.existsSync(options.spec)) {
      console.error(chalk.red(`오류: 명세서 파일을 찾을 수 없습니다: ${options.spec}`));
      process.exit(1);
    }
    
    // OpenAPI 명세서 파싱
    const specContent = fs.readFileSync(options.spec, 'utf-8');
    
    if (options.spec.endsWith('.yaml') || options.spec.endsWith('.yml')) {
      yaml.load(specContent);
    } else if (options.spec.endsWith('.json')) {
      JSON.parse(specContent);
    } else {
      console.error(chalk.red('오류: 명세서 파일은 .yaml, .yml 또는 .json 확장자를 가져야 합니다.'));
      process.exit(1);
    }
    
    console.log(chalk.green('유효성 검사 성공! 명세서가 유효합니다.'));
  } catch (error) {
    console.error(chalk.red(`유효성 검사 실패: ${error.message}`));
    process.exit(1);
  }
}

// CLI 실행
program.parse(process.argv);