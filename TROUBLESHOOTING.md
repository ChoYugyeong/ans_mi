# 🆘 Mitum Ansible 문제 해결 가이드

## 목차
- [일반적인 문제](#일반적인-문제)
- [연결 문제](#연결-문제)
- [배포 문제](#배포-문제)
- [노드 문제](#노드-문제)
- [성능 문제](#성능-문제)
- [디버깅 도구](#디버깅-도구)

## 일반적인 문제

### Python 버전 오류
**증상**: `Python 3.8 or higher is required`

**해결방법**:
```bash
# 현재 Python 버전 확인
python3 --version

# macOS에서 Python 3.9 설치
brew install python@3.9

# Ubuntu/Debian에서 Python 3.9 설치
sudo apt update
sudo apt install python3.9 python3.9-venv
```

### Ansible 설치 실패
**증상**: `ansible: command not found`

**해결방법**:
```bash
# 가상환경 재생성
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 연결 문제

### SSH 연결 실패
**증상**: `Permission denied (publickey)`

**해결방법**:
1. SSH 키 권한 확인:
```bash
chmod 600 keys/ssh/*/mitum_key
chmod 644 keys/ssh/*/mitum_key.pub
```

2. SSH 에이전트 확인:
```bash
eval $(ssh-agent)
ssh-add keys/ssh/production/mitum_key
```

3. 연결 테스트:
```bash
ansible all -m ping -i inventories/production/hosts.yml -vvv
```

### 호스트 키 검증 실패
**증상**: `Host key verification failed`

**해결방법**:
```bash
# 임시 해결 (개발 환경만)
export ANSIBLE_HOST_KEY_CHECKING=False

# 영구 해결
ssh-keyscan -H <host-ip> >> ~/.ssh/known_hosts
```

## 배포 문제

### 패키지 설치 실패
**증상**: `Package not found` 또는 `Unable to install package`

**해결방법**:
```bash
# 패키지 캐시 업데이트
ansible all -m apt -a "update_cache=yes" -b

# 수동으로 패키지 설치
ansible all -m apt -a "name=python3-pip state=present" -b
```

### 권한 오류
**증상**: `Permission denied` 또는 `sudo: password required`

**해결방법**:
1. sudo 권한 설정:
```bash
# 비밀번호 입력 방식
ansible-playbook playbooks/deploy-mitum.yml --ask-become-pass

# 또는 sudoers 설정 (프로덕션 권장)
echo "ubuntu ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/ubuntu
```

## 노드 문제

### Mitum 서비스 시작 실패
**증상**: `mitum.service failed to start`

**해결방법**:
1. 로그 확인:
```bash
# 서비스 로그
ansible node0 -m shell -a "journalctl -u mitum -n 100"

# Mitum 로그
ansible node0 -m shell -a "tail -100 /opt/mitum/logs/mitum.log"
```

2. 설정 파일 검증:
```bash
# 설정 파일 문법 검사
ansible node0 -m shell -a "mitum node info /opt/mitum/config/node.yml"
```

### 노드 동기화 실패
**증상**: 블록 높이가 증가하지 않음

**해결방법**:
```bash
# 노드 상태 확인
make status

# 피어 연결 상태 확인
ansible mitum_nodes -m shell -a "curl -s http://localhost:54321/node | jq '.suffrage'"

# 노드 재시작
ansible mitum_nodes -m service -a "name=mitum state=restarted" -b
```

### MongoDB 연결 실패
**증상**: `MongoDB connection failed`

**해결방법**:
```bash
# MongoDB 상태 확인
ansible mitum_nodes -m service -a "name=mongod state=started" -b

# MongoDB 로그 확인
ansible mitum_nodes -m shell -a "tail -50 /var/log/mongodb/mongod.log"

# 방화벽 규칙 확인
ansible mitum_nodes -m shell -a "sudo ufw status"
```

## 성능 문제

### 배포 속도가 느림
**해결방법**:
```bash
# 병렬 처리 증가
PARALLEL_FORKS=100 make deploy

# SSH 연결 재사용
echo "ControlMaster auto" >> ~/.ssh/config
echo "ControlPath ~/.ssh/sockets/%r@%h-%p" >> ~/.ssh/config
echo "ControlPersist 600" >> ~/.ssh/config
```

### 메모리 부족
**증상**: `Out of memory` 오류

**해결방법**:
```bash
# 메모리 사용량 확인
ansible all -m shell -a "free -h"

# 스왑 추가
ansible all -m shell -a "sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile" -b
```

## 디버깅 도구

### 상세 로그 활성화
```bash
# Ansible 디버그 모드
ANSIBLE_DEBUG=1 ansible-playbook playbooks/site.yml -vvvv

# 특정 태스크만 실행
ansible-playbook playbooks/site.yml --tags "keygen" -vv
```

### 실시간 모니터링
```bash
# 시각적 대시보드
make dashboard

# 실시간 모니터링
make monitor

# 로그 스트리밍
ansible mitum_nodes -m shell -a "tail -f /opt/mitum/logs/mitum.log"
```

### 유용한 디버깅 명령어
```bash
# 변수 확인
ansible all -m debug -a "var=hostvars[inventory_hostname]"

# 팩트 수집
ansible all -m setup

# 특정 호스트만 테스트
ansible-playbook playbooks/site.yml --limit node0

# 체크 모드 (dry-run)
ansible-playbook playbooks/site.yml --check
```

## 추가 도움말

### 로그 위치
- Ansible 로그: `logs/ansible.log`
- Mitum 로그: `/opt/mitum/logs/mitum.log`
- 시스템 로그: `journalctl -u mitum`

### 백업 및 복구
```bash
# 긴급 백업
make backup

# 특정 시점으로 복원
make restore BACKUP_TIMESTAMP=20250101-120000
```

### 지원 요청
문제가 지속되면 다음 정보와 함께 이슈를 제출해주세요:
1. `ansible --version` 출력
2. `make test` 결과
3. 관련 로그 파일
4. 실행한 명령어

---

💡 **팁**: 대부분의 문제는 `make test`로 사전에 발견할 수 있습니다! 