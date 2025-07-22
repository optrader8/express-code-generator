const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class CodeGenerator {
  constructor(spec, options) {
    this.spec = spec;
    this.options = options;
    this.outputDir = options.output;
    this.projectName = path.basename(this.outputDir);
  }

  async generate() {
    console.log(chalk.blue('📦 프로젝트 구조 생성 중...'));
    
    // 출력 디렉토리 생성
    this.createDirectory(this.outputDir);
    
    // 프로젝트 구조 생성
    await this.createProjectStructure();
    
    // 파일들 생성
    await this.generateFiles();
    
    console.log(chalk.green('✅ Express.js 프로젝트 생성 완료!'));
    console.log(chalk.yellow(`📁 프로젝트 위치: ${this.outputDir}`));
    console.log(chalk.cyan('\n🚀 시작하기:'));
    console.log(chalk.white(`  cd ${this.projectName}`));
    console.log(chalk.white('  npm install'));
    console.log(chalk.white('  npm start'));
  }

  createDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async createProjectStructure() {
    const directories = [
      'src',
      'src/api',
      'src/config',
      'src/middlewares',
      'src/models',
      'src/services',
      'src/repositories',
      'tests',
      'docs'
    ];

    directories.forEach(dir => {
      this.createDirectory(path.join(this.outputDir, dir));
    });
  }

  async generateFiles() {
    // Package.json 생성
    await this.generatePackageJson();
    
    // 설정 파일들 생성
    await this.generateConfigFiles();
    
    // 미들웨어 생성
    await this.generateMiddlewares();
    
    // 모델 생성
    await this.generateModels();
    
    // 서비스 생성
    await this.generateServices();
    
    // 레포지토리 생성
    await this.generateRepositories();
    
    // API 라우트 생성
    await this.generateRoutes();
    
    // 메인 앱 파일 생성
    await this.generateAppFile();
    
    // 기타 파일들 생성
    await this.generateMiscFiles();
  }

  async generatePackageJson() {
    const packageJson = {
      "name": this.projectName,
      "version": "1.0.0",
      "description": this.spec.info?.description || "Express.js API generated from OpenAPI specification",
      "main": "src/app.js",
      "scripts": {
        "start": "node src/app.js",
        "dev": "nodemon src/app.js",
        "test": "jest",
        "lint": "eslint src/",
        "format": "prettier --write \"src/**/*.js\""
      },
      "keywords": ["express", "api", "openapi", "swagger"],
      "author": "",
      "license": "MIT",
      "dependencies": {
        "bcryptjs": "^2.4.3",
        "cors": "^2.8.5",
        "dotenv": "^16.0.3",
        "express": "^4.18.2",
        "express-validator": "^7.0.1",
        "helmet": "^7.0.0",
        "jsonwebtoken": "^9.0.0",
        "morgan": "^1.10.0",
        "uuid": "^9.0.0",
        "winston": "^3.8.2"
      },
      "devDependencies": {
        "eslint": "^8.40.0",
        "jest": "^29.5.0",
        "nodemon": "^2.0.22",
        "prettier": "^2.8.8",
        "supertest": "^6.3.3"
      }
    };

    // 데이터베이스 의존성 추가
    if (this.options.db === 'mongodb') {
      packageJson.dependencies.mongoose = "^7.1.0";
    } else if (this.options.db === 'postgres') {
      packageJson.dependencies.sequelize = "^6.31.1";
      packageJson.dependencies.pg = "^8.11.0";
    } else if (this.options.db === 'mysql') {
      packageJson.dependencies.sequelize = "^6.31.1";
      packageJson.dependencies.mysql2 = "^3.3.0";
    } else {
      packageJson.dependencies.sequelize = "^6.31.1";
      packageJson.dependencies.sqlite3 = "^5.1.6";
    }

    this.writeFile('package.json', JSON.stringify(packageJson, null, 2));
  }

  async generateConfigFiles() {
    // 소스 디렉토리에서 설정 파일들 복사
    const sourceDir = path.join(__dirname, '../../src');
    
    this.copyFile(path.join(sourceDir, 'config/database.js'), 'src/config/database.js');
    this.copyFile(path.join(sourceDir, 'config/server.js'), 'src/config/server.js');
    this.copyFile(path.join(sourceDir, 'config/jwt.js'), 'src/config/jwt.js');
  }

  async generateMiddlewares() {
    const sourceDir = path.join(__dirname, '../../src');
    
    this.copyFile(path.join(sourceDir, 'middlewares/auth.js'), 'src/middlewares/auth.js');
    this.copyFile(path.join(sourceDir, 'middlewares/error-handler.js'), 'src/middlewares/error-handler.js');
    this.copyFile(path.join(sourceDir, 'middlewares/validator.js'), 'src/middlewares/validator.js');
  }

  async generateModels() {
    const sourceDir = path.join(__dirname, '../../src');
    
    this.copyFile(path.join(sourceDir, 'models/user.model.js'), 'src/models/user.model.js');
    this.copyFile(path.join(sourceDir, 'models/session.model.js'), 'src/models/session.model.js');
    this.copyFile(path.join(sourceDir, 'models/security-log.model.js'), 'src/models/security-log.model.js');
    this.copyFile(path.join(sourceDir, 'models/api-key.model.js'), 'src/models/api-key.model.js');
    this.copyFile(path.join(sourceDir, 'models/notification-settings.model.js'), 'src/models/notification-settings.model.js');
  }

  async generateServices() {
    const sourceDir = path.join(__dirname, '../../src');
    
    this.copyFile(path.join(sourceDir, 'services/auth.service.js'), 'src/services/auth.service.js');
    this.copyFile(path.join(sourceDir, 'services/user.service.js'), 'src/services/user.service.js');
  }

  async generateRepositories() {
    const sourceDir = path.join(__dirname, '../../src');
    
    this.copyFile(path.join(sourceDir, 'repositories/user.repository.js'), 'src/repositories/user.repository.js');
    this.copyFile(path.join(sourceDir, 'repositories/session.repository.js'), 'src/repositories/session.repository.js');
    this.copyFile(path.join(sourceDir, 'repositories/security-log.repository.js'), 'src/repositories/security-log.repository.js');
  }

  async generateRoutes() {
    const sourceDir = path.join(__dirname, '../../src');
    
    this.copyFile(path.join(sourceDir, 'api/auth.routes.js'), 'src/api/auth.routes.js');
    this.copyFile(path.join(sourceDir, 'api/user.routes.js'), 'src/api/user.routes.js');
  }

  async generateAppFile() {
    const sourceDir = path.join(__dirname, '../../src');
    this.copyFile(path.join(sourceDir, 'app.js'), 'src/app.js');
  }

  async generateMiscFiles() {
    // .env 파일 생성
    const envContent = `# 환경 설정
NODE_ENV=development
PORT=3000

# 데이터베이스 설정
DB_TYPE=${this.options.db}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${this.projectName}_db
DB_USER=username
DB_PASSWORD=password

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS 설정
CORS_ORIGIN=http://localhost:3001

# 로그 레벨
LOG_LEVEL=debug
`;

    this.writeFile('.env', envContent);

    // .gitignore 생성
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

    this.writeFile('.gitignore', gitignoreContent);

    // swagger.json 파일을 루트에 복사
    await this.copySwaggerSpec();

    // API 문서 생성
    await this.generateApiDocumentation();

    // README.md 생성
    const readmeContent = `# ${this.projectName}

${this.spec.info?.description || 'Express.js API generated from OpenAPI specification'}

## 시작하기

### 설치

\`\`\`bash
npm install
\`\`\`

### 환경 설정

\`.env\` 파일을 수정하여 데이터베이스 및 기타 설정을 구성하세요.

### 실행

개발 모드:
\`\`\`bash
npm run dev
\`\`\`

프로덕션 모드:
\`\`\`bash
npm start
\`\`\`

### API 문서

- **OpenAPI 명세서**: \`swagger.json\` 파일 참조
- **API 문서**: \`docs/api.md\` 파일 참조
- **Swagger UI**: 서버 실행 후 \`/api-docs\`에서 확인 가능

### 테스트

\`\`\`bash
npm test
\`\`\`

## API 엔드포인트

이 프로젝트는 다음 주요 엔드포인트를 제공합니다:

- **인증**: \`/api/v1/auth/*\`
- **사용자 관리**: \`/api/v1/users/*\`

자세한 API 문서는 \`docs/api.md\` 또는 \`swagger.json\` 명세서를 참조하세요.

## 프로젝트 구조

\`\`\`
${this.projectName}/
├── src/
│   ├── api/           # API 라우트
│   ├── config/        # 설정 파일
│   ├── middlewares/   # 미들웨어
│   ├── models/        # 데이터 모델
│   ├── repositories/  # 데이터 액세스 계층
│   ├── services/      # 비즈니스 로직
│   └── app.js         # 메인 애플리케이션
├── docs/              # API 문서
├── tests/             # 테스트 파일
├── swagger.json       # OpenAPI 명세서
├── .env              # 환경 변수
└── package.json      # 프로젝트 설정
\`\`\`

## 데이터베이스

현재 설정된 데이터베이스: ${this.options.db}

## 기여하기

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 라이선스

MIT License
`;

    this.writeFile('README.md', readmeContent);
  }

  async copySwaggerSpec() {
    try {
      const specContent = JSON.stringify(this.spec, null, 2);
      this.writeFile('swagger.json', specContent);
      console.log(chalk.gray(`📋 복사됨: swagger.json`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Swagger 스펙 복사 실패: ${error.message}`));
    }
  }

  async generateApiDocumentation() {
    const apiDoc = this.generateMarkdownApiDoc();
    this.writeFile('docs/api.md', apiDoc);
    console.log(chalk.gray(`📚 생성됨: docs/api.md`));
  }

  generateMarkdownApiDoc() {
    const spec = this.spec;
    let markdown = `# ${spec.info?.title || 'API Documentation'}

${spec.info?.description || ''}

**버전**: ${spec.info?.version || '1.0.0'}

---

## 목차

- [개요](#개요)
- [인증](#인증)
- [서버 정보](#서버-정보)
- [API 엔드포인트](#api-엔드포인트)
- [데이터 모델](#데이터-모델)
- [오류 코드](#오류-코드)

---

## 개요

이 API는 ${spec.info?.description || 'RESTful 웹 서비스'}를 제공합니다.

### 기본 정보

- **API 버전**: ${spec.info?.version || '1.0.0'}
- **기본 Content-Type**: \`application/json\`
- **문자 인코딩**: UTF-8

`;

    // 인증 정보
    if (spec.components?.securitySchemes) {
      markdown += `## 인증

`;
      Object.entries(spec.components.securitySchemes).forEach(([name, scheme]) => {
        markdown += `### ${name}

- **타입**: ${scheme.type}
- **스키마**: ${scheme.scheme || 'N/A'}
- **설명**: ${scheme.description || ''}

`;
      });
    }

    // 서버 정보
    if (spec.servers && spec.servers.length > 0) {
      markdown += `## 서버 정보

| 환경 | URL | 설명 |
|------|-----|------|
`;
      spec.servers.forEach(server => {
        markdown += `| ${server.description || 'Unknown'} | \`${server.url}\` | ${server.description || ''} |
`;
      });
      markdown += `
`;
    }

    // API 엔드포인트
    markdown += `## API 엔드포인트

`;

    if (spec.paths) {
      Object.entries(spec.paths).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
          if (typeof operation === 'object' && operation.operationId) {
            markdown += `### ${method.toUpperCase()} ${path}

**${operation.summary || operation.operationId}**

${operation.description || ''}

`;

            // 태그
            if (operation.tags && operation.tags.length > 0) {
              markdown += `**태그**: ${operation.tags.join(', ')}

`;
            }

            // 요청 파라미터
            if (operation.parameters && operation.parameters.length > 0) {
              markdown += `**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
`;
              operation.parameters.forEach(param => {
                const required = param.required ? '✅' : '❌';
                const type = param.schema?.type || 'string';
                markdown += `| \`${param.name}\` | ${param.in} | ${type} | ${required} | ${param.description || ''} |
`;
              });
              markdown += `
`;
            }

            // 요청 바디
            if (operation.requestBody) {
              markdown += `**요청 바디**:

`;
              if (operation.requestBody.content) {
                Object.entries(operation.requestBody.content).forEach(([mediaType, content]) => {
                  markdown += `- **Content-Type**: \`${mediaType}\`
`;
                  if (content.schema && content.schema.$ref) {
                    const schemaName = content.schema.$ref.split('/').pop();
                    markdown += `- **스키마**: [${schemaName}](#${schemaName.toLowerCase()})
`;
                  }
                });
              }
              markdown += `
`;
            }

            // 응답
            if (operation.responses) {
              markdown += `**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
`;
              Object.entries(operation.responses).forEach(([statusCode, response]) => {
                let schemaInfo = '';
                if (response.content) {
                  Object.entries(response.content).forEach(([mediaType, content]) => {
                    if (content.schema && content.schema.$ref) {
                      const schemaName = content.schema.$ref.split('/').pop();
                      schemaInfo = `[${schemaName}](#${schemaName.toLowerCase()})`;
                    }
                  });
                }
                markdown += `| ${statusCode} | ${response.description || ''} | ${schemaInfo} |
`;
              });
              markdown += `
`;
            }

            markdown += `---

`;
          }
        });
      });
    }

    // 데이터 모델
    if (spec.components?.schemas) {
      markdown += `## 데이터 모델

`;
      Object.entries(spec.components.schemas).forEach(([schemaName, schema]) => {
        markdown += `### ${schemaName}

${schema.description || ''}

`;
        if (schema.type === 'object' && schema.properties) {
          markdown += `**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
`;
          Object.entries(schema.properties).forEach(([propName, prop]) => {
            const required = schema.required && schema.required.includes(propName) ? '✅' : '❌';
            const type = prop.type || (prop.$ref ? prop.$ref.split('/').pop() : 'object');
            markdown += `| \`${propName}\` | ${type} | ${required} | ${prop.description || ''} |
`;
          });
          markdown += `
`;
        }

        if (schema.example) {
          markdown += `**예시**:

\`\`\`json
${JSON.stringify(schema.example, null, 2)}
\`\`\`

`;
        }

        markdown += `---

`;
      });
    }

    // 오류 코드
    markdown += `## 오류 코드

이 API는 표준 HTTP 상태 코드를 사용합니다:

| 상태 코드 | 설명 |
|-----------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 409 | 충돌 |
| 422 | 처리할 수 없는 엔티티 |
| 429 | 요청 제한 초과 |
| 500 | 내부 서버 오류 |

---

*이 문서는 OpenAPI 명세서로부터 자동 생성되었습니다.*
`;

    return markdown;
  }

  copyFile(source, destination) {
    try {
      if (fs.existsSync(source)) {
        const content = fs.readFileSync(source, 'utf8');
        this.writeFile(destination, content);
        console.log(chalk.gray(`📄 복사됨: ${destination}`));
      } else {
        console.log(chalk.yellow(`⚠️  소스 파일을 찾을 수 없음: ${source}`));
      }
    } catch (error) {
      console.log(chalk.red(`❌ 파일 복사 실패: ${destination} - ${error.message}`));
    }
  }

  writeFile(filename, content) {
    const filePath = path.join(this.outputDir, filename);
    fs.writeFileSync(filePath, content);
    console.log(chalk.gray(`📝 생성됨: ${filename}`));
  }
}

module.exports = CodeGenerator;