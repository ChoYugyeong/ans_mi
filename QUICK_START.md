# 🚀 Mitum Ansible 빠른 시작 가이드

> 5분 안에 Mitum 블록체인을 배포해보세요!

## 🎯 한 줄 설치

```bash
curl -sSL https://raw.githubusercontent.com/your-org/mitum-ansible/main/install.sh | bash
```

## 📋 빠른 시작 단계

### 1️⃣ 대화형 설정 (권장)

가장 쉬운 방법입니다:

```bash
./scripts/interactive-setup.sh
```

이 스크립트가 자동으로:
- ✅ 환경 설정
- ✅ SSH 키 생성
- ✅ 인벤토리 파일 생성
- ✅ 기본 설정 구성

### 2️⃣ 수동 설정 (고급 사용자)

#### Step 1: 가상 환경 설정
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Step 2: 인벤토리 복사
```bash
cp inventories/development/hosts.yml.example inventories/development/hosts.yml
```

#### Step 3: 노드 IP 수정
```yaml
# inventories/development/hosts.yml
mitum_nodes:
  hosts:
    node0:
      ansible_host: 192.168.1.10  # 여기에 실제 IP 입력
    node1:
      ansible_host: 192.168.1.11  # 여기에 실제 IP 입력
```

## 🏃‍♂️ 배포 실행

### 개발 환경
```bash
# 연결 테스트
make test ENV=development

# 시스템 준비
make prepare ENV=development

# Mitum 배포
make deploy ENV=development
```

### 프로덕션 환경
```bash
# 안전한 배포 (드라이런 포함)
make safe-deploy ENV=production
```

## 🔍 상태 확인

```bash
# 노드 상태 확인
make status

# 로그 확인
make logs

# 대시보드 열기
make dashboard
```

## 💡 유용한 명령어

| 명령어 | 설명 |
|--------|------|
| `make help` | 모든 명령어 보기 |
| `make test` | 연결 테스트 |
| `make deploy` | 전체 배포 |
| `make status` | 상태 확인 |
| `make logs` | 로그 보기 |
| `make backup` | 백업 생성 |
| `make restore` | 백업 복원 |
| `make clean` | 정리 |

## 🆘 문제 해결

### 연결 실패
```bash
# SSH 키 권한 확인
chmod 600 keys/ssh/*/mitum_key

# 연결 테스트
ansible all -m ping -i inventories/development/hosts.yml
```

### Python 버전 오류
```bash
# Python 3.8+ 필요
python3 --version

# macOS
brew install python@3.9

# Ubuntu
sudo apt update && sudo apt install python3.9
```

### Ansible 오류
```bash
# Ansible 재설치
pip install --upgrade ansible
```

## 📚 다음 단계

1. [상세 문서](README.md) 읽기
2. [문제 해결 가이드](TROUBLESHOOTING.md) 확인
3. [고급 설정](docs/ADVANCED.md) 살펴보기

## 🎉 축하합니다!

이제 Mitum 블록체인이 실행 중입니다! 

웹 대시보드: http://your-node-ip:54321

---

도움이 필요하시면 언제든 문의해주세요! 🤝 