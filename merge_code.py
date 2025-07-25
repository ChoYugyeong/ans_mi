#!/usr/bin/env python3
"""
프로젝트의 모든 코드 파일을 하나의 텍스트 파일로 통합하는 스크립트
대용량 프로젝트는 자동으로 여러 파일로 분할
"""

import os
import sys
from pathlib import Path
from datetime import datetime
import argparse

# 기본 제외 패턴
DEFAULT_EXCLUDE_DIRS = {
    '.git', '__pycache__', 'node_modules', '.venv', 'venv', 
    'env', '.env', 'dist', 'build', '.idea', '.vscode',
    'coverage', '.pytest_cache', '.mypy_cache', 'htmlcov',
    '.next', '.nuxt', 'out', '.cache', 'tmp', 'temp'
}

DEFAULT_EXCLUDE_FILES = {
    '.DS_Store', 'Thumbs.db', '.gitignore', '.env',
    '*.pyc', '*.pyo', '*.pyd', '*.so', '*.dll', '*.dylib',
    '*.class', '*.jar', '*.war', '*.ear',
    '*.log', '*.pot', '*.mo', '*.po',
    '*.db', '*.sqlite', '*.sqlite3',
    '*.jpg', '*.jpeg', '*.png', '*.gif', '*.ico', '*.svg',
    '*.mp3', '*.mp4', '*.avi', '*.mov', '*.wmv',
    '*.pdf', '*.doc', '*.docx', '*.xls', '*.xlsx',
    '*.zip', '*.tar', '*.gz', '*.rar', '*.7z',
    '*.exe', '*.msi', '*.app', '*.deb', '*.rpm'
}

# 코드 파일 확장자
CODE_EXTENSIONS = {
    # 프로그래밍 언어
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.c', '.cpp', 
    '.cc', '.cxx', '.h', '.hpp', '.cs', '.php', '.rb', '.go',
    '.rs', '.swift', '.kt', '.scala', '.r', '.m', '.mm',
    '.pl', '.pm', '.lua', '.dart', '.elm', '.clj', '.cljs',
    '.ex', '.exs', '.erl', '.hrl', '.hs', '.lhs', '.ml', '.mli',
    '.fs', '.fsi', '.fsx', '.v', '.vhd', '.vhdl',
    
    # 웹 관련
    '.html', '.htm', '.css', '.scss', '.sass', '.less',
    '.vue', '.svelte', '.astro',
    
    # 설정/데이터
    '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg',
    '.conf', '.config', '.env.example', '.properties',
    
    # 스크립트/셸
    '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
    
    # 기타
    '.sql', '.graphql', '.gql', '.proto', '.thrift',
    '.md', '.rst', '.txt', '.dockerfile', 'Dockerfile',
    'Makefile', 'makefile', 'CMakeLists.txt', '.gitignore',
    '.dockerignore', '.editorconfig', '.prettierrc',
    '.eslintrc', 'package.json', 'requirements.txt',
    'Gemfile', 'Cargo.toml', 'go.mod', 'pom.xml',
    'build.gradle', '.gitlab-ci.yml', '.travis.yml',
    'docker-compose.yml', 'docker-compose.yaml'
}

# Claude 대화 용량 제한 설정 (바이트)
# 안전한 기본값: 1MB (Claude는 보통 100K 토큰 제한, 1토큰 ≈ 4바이트)
DEFAULT_MAX_SIZE = 1 * 1024 * 1024  # 1MB
SAFE_MAX_SIZE = 500 * 1024  # 500KB (매우 안전)
LARGE_MAX_SIZE = 2 * 1024 * 1024  # 2MB (큰 대화창)

def should_include_file(file_path, include_extensions=None):
    """파일을 포함할지 결정"""
    file_name = file_path.name
    
    # 특정 파일명은 확장자와 관계없이 포함
    special_files = {
        'Dockerfile', 'Makefile', 'makefile', 'CMakeLists.txt',
        'package.json', 'requirements.txt', 'Gemfile', 'Cargo.toml',
        'go.mod', 'pom.xml', 'build.gradle'
    }
    
    if file_name in special_files:
        return True
    
    # 확장자 확인
    if include_extensions:
        return file_path.suffix.lower() in include_extensions
    else:
        return file_path.suffix.lower() in CODE_EXTENSIONS

def should_exclude_path(path, exclude_patterns):
    """경로를 제외할지 결정"""
    path_str = str(path)
    
    for pattern in exclude_patterns:
        if '*' in pattern:
            # 와일드카드 패턴 처리
            import fnmatch
            if fnmatch.fnmatch(path.name, pattern):
                return True
        else:
            # 일반 문자열 매칭
            if pattern in path_str:
                return True
    
    return False

def get_file_content(file_path):
    """파일 내용을 안전하게 읽기"""
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp949', 'euc-kr']
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
        except Exception as e:
            return f"# 파일 읽기 오류: {str(e)}"
    
    return "# 파일을 읽을 수 없습니다 (인코딩 문제)"

def format_file_header(file_path, project_root):
    """파일 헤더 포맷팅"""
    relative_path = file_path.relative_to(project_root)
    separator = "=" * 80
    
    return f"""
{separator}
파일: {relative_path}
{separator}
"""

def estimate_size(content):
    """콘텐츠의 예상 크기 계산 (바이트)"""
    return len(content.encode('utf-8'))

def create_file_tree(all_files, project_root):
    """파일 트리 구조 생성"""
    tree_content = "## 📁 디렉토리 구조\n\n```\n"
    printed_dirs = set()
    
    for file_path in all_files:
        relative_path = file_path.relative_to(project_root)
        
        # 상위 디렉토리들 출력
        for i, parent in enumerate(relative_path.parents[:-1]):
            if parent not in printed_dirs:
                indent = "  " * (len(relative_path.parents) - i - 2)
                tree_content += f"{indent}{parent.name}/\n"
                printed_dirs.add(parent)
        
        # 파일 출력
        indent = "  " * (len(relative_path.parents) - 1)
        tree_content += f"{indent}{file_path.name}\n"
    
    tree_content += "```\n\n"
    return tree_content

def write_header(out_file, project_root, part_num=None, total_parts=None):
    """파일 헤더 작성"""
    header = f"""# 프로젝트 코드 통합 파일"""
    
    if part_num and total_parts:
        header += f" (파트 {part_num}/{total_parts})"
    
    header += f"""
# 생성일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
# 프로젝트 경로: {project_root}

"""
    out_file.write(header)

def write_statistics(out_file, file_count, total_lines, file_types, file_size):
    """통계 정보 작성"""
    out_file.write(f"\n\n{'=' * 80}\n")
    out_file.write("## 📊 통계 정보\n\n")
    out_file.write(f"- 총 파일 수: {file_count:,}개\n")
    out_file.write(f"- 총 라인 수: {total_lines:,}줄\n")
    out_file.write(f"- 출력 파일 크기: {file_size:,} bytes\n\n")
    
    if file_types:
        out_file.write("### 파일 타입별 분포:\n")
        for ext, count in sorted(file_types.items(), key=lambda x: x[1], reverse=True):
            out_file.write(f"  - {ext}: {count}개\n")

def merge_project_files(project_path, output_file, exclude_dirs=None, 
                       exclude_files=None, include_extensions=None,
                       max_size=DEFAULT_MAX_SIZE, force_single=False):
    """프로젝트의 모든 코드 파일을 하나로 합치기 (자동 분할 지원)"""
    
    project_root = Path(project_path).resolve()
    if not project_root.exists():
        print(f"오류: 경로를 찾을 수 없습니다 - {project_root}")
        return False
    
    # 제외 패턴 설정
    exclude_dirs = exclude_dirs or DEFAULT_EXCLUDE_DIRS
    exclude_files = exclude_files or DEFAULT_EXCLUDE_FILES
    
    # 파일 수집
    all_files = []
    for root, dirs, files in os.walk(project_root):
        root_path = Path(root)
        
        # 제외할 디렉토리 필터링
        dirs[:] = [d for d in dirs if not should_exclude_path(root_path / d, exclude_dirs)]
        
        for file in files:
            file_path = root_path / file
            
            # 제외 파일 체크
            if should_exclude_path(file_path, exclude_files):
                continue
            
            # 포함할 파일인지 체크
            if should_include_file(file_path, include_extensions):
                all_files.append(file_path)
    
    # 경로 기준으로 정렬
    all_files.sort()
    
    if not all_files:
        print("경고: 처리할 파일을 찾을 수 없습니다.")
        return False
    
    # 파일 트리 생성
    file_tree = create_file_tree(all_files, project_root)
    tree_size = estimate_size(file_tree)
    
    # 파일 크기 미리 계산
    file_sizes = []
    total_estimated_size = tree_size
    
    for file_path in all_files:
        content = get_file_content(file_path)
        header = format_file_header(file_path, project_root)
        file_size = estimate_size(header + content + "\n")
        file_sizes.append((file_path, content, header, file_size))
        total_estimated_size += file_size
    
    # 분할이 필요한지 확인
    if not force_single and total_estimated_size > max_size:
        print(f"\n⚠️  전체 크기가 {max_size:,} bytes를 초과합니다.")
        print(f"   예상 크기: {total_estimated_size:,} bytes")
        print(f"   파일을 여러 부분으로 분할합니다.\n")
        
        return split_and_merge_files(
            project_root, output_file, file_tree, file_sizes, max_size
        )
    
    # 단일 파일로 출력
    output_path = Path(output_file).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    file_count = 0
    total_lines = 0
    file_types = {}
    
    with open(output_path, 'w', encoding='utf-8') as out_file:
        write_header(out_file, project_root)
        out_file.write(file_tree)
        out_file.write("## 📄 파일 내용\n")
        
        for file_path, content, header, _ in file_sizes:
            out_file.write(header)
            out_file.write(content)
            if not content.endswith('\n'):
                out_file.write('\n')
            
            # 통계 업데이트
            file_count += 1
            total_lines += len(content.splitlines())
            
            # 파일 타입별 통계
            ext = file_path.suffix.lower() or 'no_ext'
            file_types[ext] = file_types.get(ext, 0) + 1
            
            print(f"처리됨: {file_path.relative_to(project_root)}")
        
        # 통계 정보 추가
        write_statistics(out_file, file_count, total_lines, file_types, 
                        output_path.stat().st_size)
    
    print(f"\n✅ 완료!")
    print(f"📁 처리된 파일: {file_count}개")
    print(f"📝 총 라인 수: {total_lines:,}줄")
    print(f"💾 출력 파일: {output_path}")
    print(f"📏 파일 크기: {output_path.stat().st_size:,} bytes")
    
    return True

def split_and_merge_files(project_root, output_file, file_tree, file_sizes, max_size):
    """파일을 여러 부분으로 분할하여 저장"""
    
    output_path = Path(output_file)
    base_name = output_path.stem
    extension = output_path.suffix or '.txt'
    
    part_num = 1
    current_size = 0
    current_files = []
    all_parts = []
    
    # 각 파트의 기본 오버헤드 계산
    base_overhead = estimate_size(
        f"# 프로젝트 코드 통합 파일 (파트 X/Y)\n" +
        f"# 생성일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n" +
        f"# 프로젝트 경로: {project_root}\n\n" +
        "## 📄 파일 내용\n"
    )
    
    tree_size = estimate_size(file_tree)
    
    # 파일 분할
    for file_info in file_sizes:
        file_path, content, header, file_size = file_info
        
        # 현재 파트에 추가할 수 있는지 확인
        estimated_part_size = current_size + file_size + base_overhead
        if part_num == 1:  # 첫 파트는 트리 포함
            estimated_part_size += tree_size
        
        if current_files and estimated_part_size > max_size:
            # 현재 파트 저장
            all_parts.append((part_num, current_files[:]))
            part_num += 1
            current_size = 0
            current_files = []
        
        current_files.append(file_info)
        current_size += file_size
    
    # 마지막 파트 저장
    if current_files:
        all_parts.append((part_num, current_files))
    
    total_parts = len(all_parts)
    
    # 각 파트 파일 생성
    total_file_count = 0
    total_line_count = 0
    all_file_types = {}
    created_files = []
    
    for part_idx, (part_num, part_files) in enumerate(all_parts):
        part_filename = output_path.parent / f"{base_name}_part{part_num}{extension}"
        
        with open(part_filename, 'w', encoding='utf-8') as out_file:
            write_header(out_file, project_root, part_num, total_parts)
            
            # 첫 파트에만 디렉토리 구조 포함
            if part_num == 1:
                out_file.write(file_tree)
            
            out_file.write("## 📄 파일 내용\n")
            
            part_file_count = 0
            part_lines = 0
            part_file_types = {}
            
            for file_path, content, header, _ in part_files:
                out_file.write(header)
                out_file.write(content)
                if not content.endswith('\n'):
                    out_file.write('\n')
                
                # 통계 업데이트
                part_file_count += 1
                part_lines += len(content.splitlines())
                total_file_count += 1
                total_line_count += len(content.splitlines())
                
                # 파일 타입별 통계
                ext = file_path.suffix.lower() or 'no_ext'
                part_file_types[ext] = part_file_types.get(ext, 0) + 1
                all_file_types[ext] = all_file_types.get(ext, 0) + 1
                
                print(f"처리됨: {file_path.relative_to(project_root)} (파트 {part_num})")
            
            # 파트별 통계
            out_file.write(f"\n\n{'=' * 80}\n")
            out_file.write(f"## 📊 파트 {part_num} 통계\n\n")
            out_file.write(f"- 이 파트의 파일 수: {part_file_count}개\n")
            out_file.write(f"- 이 파트의 라인 수: {part_lines:,}줄\n")
            out_file.write(f"- 이 파트의 크기: {part_filename.stat().st_size:,} bytes\n")
            
            # 마지막 파트에 전체 통계 추가
            if part_num == total_parts:
                write_statistics(out_file, total_file_count, total_line_count, 
                               all_file_types, sum(f.stat().st_size for f in created_files))
        
        created_files.append(part_filename)
        print(f"💾 파트 {part_num} 저장됨: {part_filename} ({part_filename.stat().st_size:,} bytes)")
    
    # 인덱스 파일 생성
    index_filename = output_path.parent / f"{base_name}_index{extension}"
    with open(index_filename, 'w', encoding='utf-8') as idx_file:
        idx_file.write(f"# 프로젝트 코드 통합 파일 인덱스\n")
        idx_file.write(f"# 생성일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        idx_file.write(f"# 총 {total_parts}개 파트로 분할됨\n\n")
        
        idx_file.write("## 📑 파트 목록\n\n")
        for i, part_file in enumerate(created_files, 1):
            size_mb = part_file.stat().st_size / (1024 * 1024)
            idx_file.write(f"{i}. {part_file.name} ({size_mb:.2f} MB)\n")
        
        idx_file.write(f"\n## 💡 사용 방법\n\n")
        idx_file.write(f"1. 각 파트를 순서대로 Claude에 전달하세요.\n")
        idx_file.write(f"2. 한 번에 하나의 파트만 복사-붙여넣기 하세요.\n")
        idx_file.write(f"3. Claude가 이전 파트를 기억하도록 '이전 파트에서 계속' 같은 문구를 사용하세요.\n")
        
        idx_file.write(f"\n## 📊 전체 통계\n\n")
        idx_file.write(f"- 총 파일 수: {total_file_count:,}개\n")
        idx_file.write(f"- 총 라인 수: {total_line_count:,}줄\n")
        idx_file.write(f"- 총 크기: {sum(f.stat().st_size for f in created_files):,} bytes\n")
    
    created_files.append(index_filename)
    
    print(f"\n✅ 분할 완료!")
    print(f"📁 처리된 파일: {total_file_count}개")
    print(f"📝 총 라인 수: {total_line_count:,}줄")
    print(f"📑 생성된 파트: {total_parts}개")
    print(f"📋 인덱스 파일: {index_filename}")
    print(f"\n💡 팁: 각 파트를 순서대로 Claude에 전달하세요!")
    
    return True

def main():
    parser = argparse.ArgumentParser(
        description='프로젝트의 모든 코드를 하나의 텍스트 파일로 통합합니다. (자동 분할 지원)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  %(prog)s .                           # 현재 디렉토리 통합
  %(prog)s /path/to/project            # 특정 프로젝트 통합
  %(prog)s . -o merged_code.txt        # 출력 파일명 지정
  %(prog)s . --include .py .js         # 특정 확장자만 포함
  %(prog)s . --exclude-dir tests      # 특정 디렉토리 제외
  %(prog)s . --max-size 500            # 최대 크기 500KB로 제한
  %(prog)s . --safe                    # 안전한 크기(500KB)로 자동 분할
  %(prog)s . --large                   # 큰 크기(2MB)로 설정
  %(prog)s . --force-single            # 크기 제한 무시하고 단일 파일로
"""
    )
    
    parser.add_argument('project_path', 
                       help='통합할 프로젝트 경로')
    
    parser.add_argument('-o', '--output', 
                       default='merged_project_code.txt',
                       help='출력 파일 경로 (기본값: merged_project_code.txt)')
    
    parser.add_argument('--include', 
                       nargs='+',
                       help='포함할 파일 확장자 목록 (예: .py .js .java)')
    
    parser.add_argument('--exclude-dir', 
                       nargs='+',
                       help='제외할 디렉토리 이름 (기본 제외 목록에 추가)')
    
    parser.add_argument('--exclude-file', 
                       nargs='+',
                       help='제외할 파일 패턴 (예: "*.test.js" "temp_*")')
    
    parser.add_argument('--max-size', 
                       type=int,
                       help='파일 최대 크기 (KB 단위, 기본값: 1024KB = 1MB)')
    
    parser.add_argument('--safe', 
                       action='store_true',
                       help='안전한 크기(500KB)로 설정')
    
    parser.add_argument('--large', 
                       action='store_true',
                       help='큰 크기(2MB)로 설정')
    
    parser.add_argument('--force-single', 
                       action='store_true',
                       help='크기 제한 무시하고 단일 파일로 생성')
    
    args = parser.parse_args()
    
    # 제외 패턴 설정
    exclude_dirs = DEFAULT_EXCLUDE_DIRS.copy()
    if args.exclude_dir:
        exclude_dirs.update(args.exclude_dir)
    
    exclude_files = DEFAULT_EXCLUDE_FILES.copy()
    if args.exclude_file:
        exclude_files.update(args.exclude_file)
    
    # 포함할 확장자 설정
    include_extensions = None
    if args.include:
        include_extensions = {ext if ext.startswith('.') else f'.{ext}' 
                            for ext in args.include}
    
    # 최대 크기 설정
    if args.safe:
        max_size = SAFE_MAX_SIZE
    elif args.large:
        max_size = LARGE_MAX_SIZE
    elif args.max_size:
        max_size = args.max_size * 1024  # KB를 바이트로 변환
    else:
        max_size = DEFAULT_MAX_SIZE
    
    # 실행
    merge_project_files(
        args.project_path,
        args.output,
        exclude_dirs=exclude_dirs,
        exclude_files=exclude_files,
        include_extensions=include_extensions,
        max_size=max_size,
        force_single=args.force_single
    )

if __name__ == "__main__":
    main()