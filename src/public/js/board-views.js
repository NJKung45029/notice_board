function togglePost(id) {
    const contentDiv = document.getElementById('content-' + id);
    
    // 닫혀있다면 -> 연다 (조회수 증가)
    if (contentDiv.style.display === 'none' || contentDiv.style.display === '') {
        contentDiv.style.display = 'block';
        
        // 서버에 조회수 증가 요청 보내기
        fetch('/board/increase-view/' + id, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // 화면의 숫자 업데이트
                    const viewSpan = document.getElementById('view-cnt-' + id);
                    if(viewSpan) viewSpan.innerText = data.newViews;
                }
            })
            .catch(err => console.error(err));
            
    } else {
        // 열려있다면 -> 닫는다
        contentDiv.style.display = 'none';
    }
}