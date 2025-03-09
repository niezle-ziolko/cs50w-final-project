import GithubIcon from 'styles/icons/github';

import 'styles/css/footer/theme.css';

export default function Footer() {
  return(
    <aside className='github'>
      <div className='box'>
        <div>
          <a href='https://github.com/niezle-ziolko/cs50-final-project' target='_blank' rel="noreferrer">
            <p>View on GitHub</p>
            <GithubIcon />
          </a>
        </div>
      </div>
    </aside>
  );
};